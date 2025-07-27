package com.mappo.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegionDto {
    
    private UUID id;
    
    @NotBlank(message = "Region name is required")
    private String name;
    
    private UUID userId;
    
    @NotNull(message = "Geometry is required")
    @JsonProperty("geoJson")
    private Object geoJson; // GeoJSON object
    
    private String createdAt;
    
    private String updatedAt;
} 