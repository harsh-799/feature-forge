package com.featureforge.backend.filter;

import com.featureforge.backend.service.CustomUserDetailsService;
import com.featureforge.backend.service.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@AllArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring("Bearer ".length());

        try {
            // Authentication is implemented with JWT for now.
            // Code structured to support additional auth strategies in the future (e.g., OAuth2).

            if (jwtService.validateJWTToken(token) && SecurityContextHolder.getContext().getAuthentication() == null) {

                String userEmail = jwtService.extractUsername(token);
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(userEmail);

                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (UsernameNotFoundException e) {
            sendResponse(response, "USER_NOT_FOUND","User not found");
            return;
        } catch (ExpiredJwtException e) {
            sendResponse(response, "TOKEN_EXPIRED","Token Expired");
            return;
        } catch (JwtException e) {
            sendResponse(response, "INVALID_TOKEN", "Invalid token");
            return;
        }

        filterChain.doFilter(request,response);
    }

    private void sendResponse(HttpServletResponse response, String code, String message) throws IOException {
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        String body = """
        {
            "success": false,
            "code": "%s",
            "message": "%s"
        }
        """.formatted(code,message);

        response.getWriter().write(body);
    }
}
