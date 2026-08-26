package com.featureforge.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class HealthResponse {
    private Boolean success;
    private String message;
    private LocalDateTime timestamp;
}
