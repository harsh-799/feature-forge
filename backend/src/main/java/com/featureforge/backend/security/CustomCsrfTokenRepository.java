package com.featureforge.backend.security;

import com.featureforge.backend.service.CsrfTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.DefaultCsrfToken;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.util.Arrays;

@Component
@AllArgsConstructor
public class CustomCsrfTokenRepository implements CsrfTokenRepository {

    private static final String COOKIE_NAME = "__Host-XSRF-TOKEN";
    private static final String HEADER_NAME = "X-XSRF-TOKEN";
    private static final String PARAMETER_NAME = "_csrf";
    private static final Duration TOKEN_EXPIRY = Duration.ofMinutes(15);

    private final CsrfTokenService csrfTokenService;
    @Override
    public CsrfToken generateToken(HttpServletRequest request) {

        String token = csrfTokenService.generateNewCsrfToken();

        return new DefaultCsrfToken(
                HEADER_NAME,
                PARAMETER_NAME,
                token
        );
    }

    @Override
    public void saveToken(@Nullable CsrfToken token, HttpServletRequest request, HttpServletResponse response) {

        String tokenValue = (token != null) ? token.getToken() : "";

        ResponseCookie cookie = ResponseCookie
                .from(COOKIE_NAME, tokenValue)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
                .maxAge(token != null ? TOKEN_EXPIRY : Duration.ZERO)
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );

    }

    @Override
    public CsrfToken loadToken(HttpServletRequest request) {

        if (request.getCookies() == null) {
            return null; // No cookie exists
        }

        Cookie csrfCookie = Arrays.stream(request.getCookies())
                .filter(cookie -> COOKIE_NAME.equals(cookie.getName()))
                .findFirst()
                .orElse(null);

        if (csrfCookie == null) {
            return null; // Cookie is missing
        }

        String token = csrfCookie.getValue();

        if (!csrfTokenService.validateCsrfToken(token)) {
            return null;
        }

        return new DefaultCsrfToken(
                HEADER_NAME,
                PARAMETER_NAME,
                token
        );
    }

}
