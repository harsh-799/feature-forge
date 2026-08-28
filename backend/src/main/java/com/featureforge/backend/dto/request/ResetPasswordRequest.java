package com.featureforge.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @Email
    @NotBlank(message = "email can't be empty")
    private String email;

    @NotBlank(message = "password can't be empty")
    private String password;
}
