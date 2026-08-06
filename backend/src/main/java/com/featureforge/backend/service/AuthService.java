package com.featureforge.backend.service;

import com.featureforge.backend.dto.request.LoginRequest;
import com.featureforge.backend.dto.request.RegisterRequest;
import com.featureforge.backend.dto.response.LoginResponse;
import com.featureforge.backend.dto.response.RegisterResponse;
import com.featureforge.backend.entity.User;
import com.featureforge.backend.exception.UserAlreadyExistsException;
import com.featureforge.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.java.Log;
import org.jspecify.annotations.Nullable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthService {

    private PasswordEncoder passwordEncoder;
    private UserRepository userRepository;
    private AuthenticationManager authenticationManager;
    private JwtService jwtService;

    public RegisterResponse register(RegisterRequest registerRequest) {

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new UserAlreadyExistsException("User already exists");
        }

        User user = User.builder()
                .fullname(registerRequest.getFullName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .build();

        User savedUser = userRepository.save(user);

        return RegisterResponse.builder()
                .success(true)
                .message("User Registered successfully.")
                .build();
    }

    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword());

        Authentication authenticated = authenticationManager.authenticate(authentication);

        UserDetails user = (UserDetails) authenticated.getPrincipal();

        String token = jwtService.generateJWTToken(user.getUsername());

        return LoginResponse.builder()
                .status(true)
                .message("Logged in successfully")
                .token(token)
                .build();
    }

    public com.featureforge.backend.dto.response.UserResponse getCurrentUser() {
        org.springframework.security.core.context.SecurityContext context = org.springframework.security.core.context.SecurityContextHolder.getContext();
        org.springframework.security.core.Authentication authentication = context.getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            User user = ((CustomUserDetails) principal).getUser();
            return com.featureforge.backend.dto.response.UserResponse.builder()
                    .email(user.getEmail())
                    .fullname(user.getFullname())
                    .build();
        }
        
        throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
    }
}
