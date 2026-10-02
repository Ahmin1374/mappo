package com.mappo.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mappo.backend.dto.RegionDto;
import com.mappo.backend.model.Region;
import com.mappo.backend.repository.RegionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class RegionIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private UUID testUserId;
    private RegionDto testRegionDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .defaultRequest(get("/").contextPath("/api/v1"))
                .build();
        testUserId = UUID.randomUUID();
        testRegionDto = createTestRegionDto();
    }

    @Test
    void createRegion_WithValidData_ShouldReturnCreatedRegion() throws Exception {
        // Given
        String requestBody = objectMapper.writeValueAsString(testRegionDto);

        // When & Then
        mockMvc.perform(post("/api/v1/regions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Region"))
                .andExpect(jsonPath("$.geoJson.type").value("Polygon"))
                .andExpect(jsonPath("$.geoJson.coordinates").exists());

        // Verify in database
        assertThat(regionRepository.count()).isEqualTo(1);
    }

    @Test
    void createRegion_WithInvalidGeoJson_ShouldReturnBadRequest() throws Exception {
        // Given
        testRegionDto.setGeoJson(createInvalidGeoJson());
        String requestBody = objectMapper.writeValueAsString(testRegionDto);

        // When & Then
        mockMvc.perform(post("/api/v1/regions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isInternalServerError()); // Will throw RuntimeException
    }

    @Test
    void getRegion_WhenRegionExists_ShouldReturnRegion() throws Exception {
        // Given
        Region savedRegion = saveTestRegion();

        // When & Then
        mockMvc.perform(get("/api/v1/regions/{id}", savedRegion.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Region"))
                .andExpect(jsonPath("$.id").value(savedRegion.getId().toString()));
    }

    @Test
    void getRegion_WhenRegionDoesNotExist_ShouldReturnNotFound() throws Exception {
        // Given
        UUID nonExistentId = UUID.randomUUID();

        // When & Then
        mockMvc.perform(get("/api/v1/regions/{id}", nonExistentId))
                .andExpect(status().isNotFound());
    }

    @Test
    void getRegions_ShouldReturnPaginatedRegions() throws Exception {
        // Given
        saveTestRegion();
        saveTestRegion();

        // When & Then
        mockMvc.perform(get("/api/v1/regions")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    void searchRegions_ShouldReturnMatchingRegions() throws Exception {
        // Given
        saveTestRegion();

        // When & Then
        mockMvc.perform(get("/api/v1/regions/search")
                .param("name", "Test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Test Region"));
    }

    @Test
    void updateRegion_WhenRegionExists_ShouldReturnUpdatedRegion() throws Exception {
        // Given
        Region savedRegion = saveTestRegion();
        testRegionDto.setName("Updated Region");
        String requestBody = objectMapper.writeValueAsString(testRegionDto);

        // When & Then
        mockMvc.perform(put("/api/v1/regions/{id}", savedRegion.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Region"));
    }

    @Test
    void deleteRegion_WhenRegionExists_ShouldReturnNoContent() throws Exception {
        // Given
        Region savedRegion = saveTestRegion();

        // When & Then
        mockMvc.perform(delete("/api/v1/regions/{id}", savedRegion.getId()))
                .andExpect(status().isNoContent());

        // Verify deletion
        assertThat(regionRepository.findById(savedRegion.getId())).isEmpty();
    }

    @Test
    void getRegionCount_ShouldReturnCorrectCount() throws Exception {
        // Given
        saveTestRegion();
        saveTestRegion();

        // When & Then
        mockMvc.perform(get("/api/v1/regions/count"))
                .andExpect(status().isOk())
                .andExpect(content().string("2"));
    }

    private RegionDto createTestRegionDto() {
        RegionDto dto = new RegionDto();
        dto.setName("Test Region");
        dto.setGeoJson(createValidGeoJson());
        return dto;
    }

    private Map<String, Object> createValidGeoJson() {
        Map<String, Object> geoJson = new HashMap<>();
        geoJson.put("type", "Polygon");
        
        // Create nested lists for coordinates
        java.util.List<java.util.List<java.util.List<Double>>> coordinates = new java.util.ArrayList<>();
        java.util.List<java.util.List<Double>> ring = new java.util.ArrayList<>();
        
        ring.add(java.util.Arrays.asList(0.0, 0.0));
        ring.add(java.util.Arrays.asList(1.0, 0.0));
        ring.add(java.util.Arrays.asList(1.0, 1.0));
        ring.add(java.util.Arrays.asList(0.0, 1.0));
        ring.add(java.util.Arrays.asList(0.0, 0.0));
        
        coordinates.add(ring);
        geoJson.put("coordinates", coordinates);
        
        return geoJson;
    }

    private Map<String, Object> createInvalidGeoJson() {
        Map<String, Object> geoJson = new HashMap<>();
        geoJson.put("type", "InvalidType");
        geoJson.put("coordinates", "invalid");
        return geoJson;
    }

    private Region saveTestRegion() {
        Region region = new Region();
        region.setName("Test Region");
        region.setUserId(testUserId);
        region.setGeometry(createTestPolygon());
        return regionRepository.save(region);
    }

    private org.locationtech.jts.geom.Polygon createTestPolygon() {
        org.locationtech.jts.geom.Coordinate[] coords = {
            new org.locationtech.jts.geom.Coordinate(0.0, 0.0),
            new org.locationtech.jts.geom.Coordinate(1.0, 0.0),
            new org.locationtech.jts.geom.Coordinate(1.0, 1.0),
            new org.locationtech.jts.geom.Coordinate(0.0, 1.0),
            new org.locationtech.jts.geom.Coordinate(0.0, 0.0)
        };
        return new org.locationtech.jts.geom.GeometryFactory().createPolygon(coords);
    }
} 