package com.featureforge.backend.service;

import com.featureforge.backend.dto.request.ChangePasswordRequest;
import com.featureforge.backend.dto.request.ResetPasswordRequest;
import com.featureforge.backend.dto.request.LoginRequest;
import com.featureforge.backend.dto.request.RegisterRequest;
import com.featureforge.backend.dto.response.ChangePasswordResponse;
import com.featureforge.backend.dto.response.LoginResponse;
import com.featureforge.backend.dto.response.ResetPasswordResponse;
import com.featureforge.backend.dto.response.RegisterResponse;
import com.featureforge.backend.entity.User;
import com.featureforge.backend.exception.*;
import com.featureforge.backend.repository.UserRepository;
import com.featureforge.backend.util.ApiKeyManager;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AuthService {

    private PasswordEncoder passwordEncoder;
    private UserRepository userRepository;
    private AuthenticationManager authenticationManager;
    private JwtService jwtService;
    private EmailService emailService;
    private ApiKeyManager apiKeyManager;

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

        CustomUserDetails user = (CustomUserDetails) authenticated.getPrincipal();

        String token = jwtService.generateJWTToken(user.getUsername());

        return LoginResponse.builder()
                .status(true)
                .message("Logged in successfully")
                .token(token)
                .fullName(user.getUser().getFullname())
                .email(user.getUser().getEmail())
                .build();
    }

    public ChangePasswordResponse changePassword(ChangePasswordRequest request) {
        CustomUserDetails customUserDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        User loggedInUser = customUserDetails.getUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), loggedInUser.getPassword())) {
            throw new InvalidCurrentPasswordException("Current password is incorrect");
        }

        loggedInUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(loggedInUser);

        ChangePasswordResponse response = new ChangePasswordResponse();
        response.setSuccess(true);
        response.setMessage("Password updated successfully");

        return response;

    }

    public ResetPasswordResponse generateToken(String email) {

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {

            User user = userOptional.get();

            LocalDateTime lastResetTokenIssuedAt =
                    user.getPasswordResetTokenIssuedAt();

            if (lastResetTokenIssuedAt != null) {
                LocalDateTime current = LocalDateTime.now();

                if (current.isBefore(lastResetTokenIssuedAt.plusSeconds(30))) {
                    throw new PasswordResetRequestTooFrequentException(
                            "Too many requests. Try again after 30 seconds."
                    );
                }
            }

            String resetToken = UUID.randomUUID().toString();
            String resetHashToken = apiKeyManager.hashApiKey(resetToken);

            LocalDateTime current = LocalDateTime.now();

            user.setPasswordResetTokenHash(resetHashToken);
            user.setPasswordResetTokenIssuedAt(current);
            user.setPasswordResetTokenExpiresAt(
                    current.plusMinutes(10)
            );

            User savedUser = userRepository.save(user);

            emailService.sendPasswordResetEmail(
                    resetToken,
                    savedUser.getEmail()
            );
        }

        ResetPasswordResponse response = new ResetPasswordResponse();
        response.setSuccess(true);
        response.setMessage("If registered, check your email for a reset link.");

        return response;
    }

    @Transactional
    public ResetPasswordResponse resetPassword(ResetPasswordRequest resetPasswordRequest, String rawToken) {
        User user = userRepository.findByEmail
                (resetPasswordRequest.getEmail()).orElseThrow(
                () -> new UsernameNotFoundException("No User Found with this email")
        );

        LocalDateTime current = LocalDateTime.now();

        if (user.getPasswordResetTokenExpiresAt() == null ||
                !current.isBefore(user.getPasswordResetTokenExpiresAt())) {
            throw new TokenAlreadyExpiredException(
                    "Invalid or expired password reset token."
            );
        }

        String hashToken = apiKeyManager.hashApiKey(rawToken);

        if (!user.getPasswordResetTokenHash().equals(hashToken))
            throw new InvalidPasswordResetTokenException("Invalid or expired password reset token.");

        user.setPassword(passwordEncoder.encode(resetPasswordRequest.getPassword()));
        user.setPasswordResetTokenHash(null);
        user.setPasswordResetTokenIssuedAt(null);
        user.setPasswordResetTokenExpiresAt(null);

        ResetPasswordResponse response = new ResetPasswordResponse();
        response.setSuccess(true);
        response.setMessage("Password reset successfully.");

        return response;

    }

}
