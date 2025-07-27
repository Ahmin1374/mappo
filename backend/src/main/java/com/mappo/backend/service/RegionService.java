package com.mappo.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mappo.backend.dto.RegionDto;
import com.mappo.backend.model.Region;
import com.mappo.backend.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.io.geojson.GeoJsonReader;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RegionService {
    
    private final RegionRepository regionRepository;
    private final ObjectMapper objectMapper;
    private final GeoJsonReader geoJsonReader = new GeoJsonReader();
    private final GeometryFactory geometryFactory = new GeometryFactory();
    
    public RegionDto createRegion(RegionDto regionDto, UUID userId) {
        Region region = new Region();
        region.setName(regionDto.getName());
        region.setUserId(userId);
        region.setGeometry(convertGeoJsonToPolygon(regionDto.getGeoJson()));
        
        Region savedRegion = regionRepository.save(region);
        return convertToDto(savedRegion);
    }
    
    public Optional<RegionDto> getRegionById(UUID id, UUID userId) {
        return regionRepository.findById(id)
                .filter(region -> region.getUserId().equals(userId))
                .map(this::convertToDto);
    }
    
    public Page<RegionDto> getRegionsByUser(UUID userId, Pageable pageable) {
        return regionRepository.findByUserId(userId, pageable)
                .map(this::convertToDto);
    }
    
    public List<RegionDto> searchRegionsByName(String name) {
        return regionRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToDto)
                .toList();
    }
    
    public Optional<RegionDto> updateRegion(UUID id, RegionDto regionDto, UUID userId) {
        return regionRepository.findById(id)
                .filter(region -> region.getUserId().equals(userId))
                .map(region -> {
                    region.setName(regionDto.getName());
                    region.setGeometry(convertGeoJsonToPolygon(regionDto.getGeoJson()));
                    return convertToDto(regionRepository.save(region));
                });
    }
    
    public boolean deleteRegion(UUID id, UUID userId) {
        return regionRepository.findById(id)
                .filter(region -> region.getUserId().equals(userId))
                .map(region -> {
                    regionRepository.delete(region);
                    return true;
                })
                .orElse(false);
    }
    
    public List<RegionDto> findRegionsWithinBounds(double minX, double minY, double maxX, double maxY) {
        return regionRepository.findRegionsWithinBounds(minX, minY, maxX, maxY)
                .stream()
                .map(this::convertToDto)
                .toList();
    }
    
    public long countRegionsByUser(UUID userId) {
        return regionRepository.countByUserId(userId);
    }
    
    public boolean existsByNameAndUser(String name, UUID userId) {
        return regionRepository.existsByNameAndUserId(name, userId);
    }
    
    private Polygon convertGeoJsonToPolygon(Object geoJson) {
        try {
            String geoJsonString = objectMapper.writeValueAsString(geoJson);
            return (Polygon) geoJsonReader.read(geoJsonString);
        } catch (Exception e) {
            throw new RuntimeException("Invalid GeoJSON format", e);
        }
    }
    
    private RegionDto convertToDto(Region region) {
        RegionDto dto = new RegionDto();
        dto.setId(region.getId());
        dto.setName(region.getName());
        dto.setUserId(region.getUserId());
        dto.setCreatedAt(region.getCreatedAt().toString());
        dto.setUpdatedAt(region.getUpdatedAt().toString());
        
        // Convert geometry back to GeoJSON
        try {
            String geoJsonString = new org.locationtech.jts.io.geojson.GeoJsonWriter().write(region.getGeometry());
            dto.setGeoJson(objectMapper.readValue(geoJsonString, Object.class));
        } catch (Exception e) {
            throw new RuntimeException("Error converting geometry to GeoJSON", e);
        }
        
        return dto;
    }
} 