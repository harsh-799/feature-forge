package com.featureforge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ActivityLogPageResponse {
    private Boolean success;
    private String message;
    private Integer page;
    private Integer size;
    private Long totalElements;
    private Boolean isLast;
    private List<ActivityLogResponse> activities;
}
