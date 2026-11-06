package com.featureforge.backend.controller;

import com.featureforge.backend.dto.request.ChangePasswordRequest;
import com.featureforge.backend.dto.request.ResetPasswordRequest;
import com.featureforge.backend.dto.request.LoginRequest;
import com.featureforge.backend.dto.request.RegisterRequest;
import com.featureforge.backend.dto.response.*;
import com.featureforge.backend.service.AuthService;
import com.featureforge.backend.service.CsrfTokenService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@AllArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final CsrfTokenService csrfTokenService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(registerRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(authService.login(loginRequest));
    }

    @PatchMapping("/change-password")
    public ResponseEntity<ChangePasswordResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(authService.changePassword(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ResetPasswordResponse> forgotPassword(@RequestParam @NotBlank @Email String email) {
        ResetPasswordResponse resp = authService.generateToken(email);
        return ResponseEntity.status(HttpStatus.OK).body(resp);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ResetPasswordResponse> validateTokenAndResetPassword(
            @RequestBody ResetPasswordRequest resetPasswordRequest,
            @RequestParam(name = "token") String token) {
        ResetPasswordResponse resp = authService.resetPassword(resetPasswordRequest, token);
        return ResponseEntity.status(HttpStatus.OK).body(resp);
    }

    @GetMapping("/csrf")
    public ResponseEntity<CsrfTokenResponse> generateCsrfToken(CsrfToken csrfToken) {
        return ResponseEntity.ok(
                new CsrfTokenResponse(csrfToken.getToken())
        );
    }

}
