package com.featureforge.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegenerateApiKeyResponse {
    private Boolean success;
    private String message;
    private String apiKey;
}
