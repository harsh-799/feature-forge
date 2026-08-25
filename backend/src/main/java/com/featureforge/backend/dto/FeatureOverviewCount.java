package com.featureforge.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FeatureOverviewCount {
    private Integer active;
    private Integer development;
    private Integer staging;
    private Integer production;

    public FeatureOverviewCount(Long active, Long development, Long staging, Long production) {
        this.active = active != null ? active.intValue() : 0;
        this.development = development != null ? development.intValue() : 0;
        this.staging = staging != null ? staging.intValue() : 0;
        this.production = production != null ? production.intValue() : 0;
    }
}
