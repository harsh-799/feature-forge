package com.featureforge.backend.controller;

import com.featureforge.backend.dto.request.ChangePasswordRequest;
import com.featureforge.backend.dto.request.LoginRequest;
import com.featureforge.backend.dto.request.RegisterRequest;
import com.featureforge.backend.dto.response.ChangePasswordResponse;
import com.featureforge.backend.dto.response.LoginResponse;
import com.featureforge.backend.dto.response.RegisterResponse;
import com.featureforge.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private AuthService authService;

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

}
