package com.featureforge.backend.service;

import com.featureforge.backend.dto.request.RegisterRequest;
import com.featureforge.backend.dto.response.RegisterResponse;
import com.featureforge.backend.entity.User;
import com.featureforge.backend.exception.UserAlreadyExistsException;
import com.featureforge.backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthService {

    private PasswordEncoder passwordEncoder;
    private UserRepository userRepository;

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
}
