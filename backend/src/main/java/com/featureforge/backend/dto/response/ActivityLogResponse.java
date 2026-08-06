package com.featureforge.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityLogResponse {
    private Long id;
    private String action;
    private String context;
    private String actor;
    private LocalDateTime timestamp;
}
