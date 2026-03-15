package com.healthplatform.alert.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthAlert {
    private String id;
    private String countryCode;
    private String type;
    private String message;
    private String timestamp;
}
