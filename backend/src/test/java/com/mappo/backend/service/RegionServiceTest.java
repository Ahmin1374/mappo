package com.mappo.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mappo.backend.dto.RegionDto;
import com.mappo.backend.model.Region;
import com.mappo.backend.repository.RegionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Polygon;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegionServiceTest {

    @Mock
    private RegionRepository regionRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private RegionService regionService;

    private UUID testUserId;
    private UUID testRegionId;
    private Region testRegion;
    private RegionDto testRegionDto;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testRegionId = UUID.randomUUID();
        
        testRegion = new Region();
        testRegion.setId(testRegionId);
        testRegion.setName("Test Region");
        testRegion.setUserId(testUserId);
        testRegion.setCreatedAt(LocalDateTime.now());
        testRegion.setUpdatedAt(LocalDateTime.now());
        
        // Create a mock geometry for testing
        org.locationtech.jts.geom.Coordinate[] coords = {
            new org.locationtech.jts.geom.Coordinate(0.0, 0.0),
            new org.locationtech.jts.geom.Coordinate(1.0, 0.0),
            new org.locationtech.jts.geom.Coordinate(1.0, 1.0),
            new org.locationtech.jts.geom.Coordinate(0.0, 1.0),
            new org.locationtech.jts.geom.Coordinate(0.0, 0.0)
        };
        org.locationtech.jts.geom.Polygon polygon = new org.locationtech.jts.geom.GeometryFactory()
                .createPolygon(coords);
        testRegion.setGeometry(polygon);
        
        testRegionDto = new RegionDto();
        testRegionDto.setName("Test Region");
        testRegionDto.setGeoJson(createTestGeoJson());
    }

    @Test
    void createRegion_ShouldCreateAndReturnRegion() throws Exception {
        // Given
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"type\":\"Polygon\",\"coordinates\":[[[0,0],[1,0],[1,1],[0,1],[0,0]]]}");
        when(regionRepository.save(any(Region.class))).thenReturn(testRegion);

        // When
        RegionDto result = regionService.createRegion(testRegionDto, testUserId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Test Region");
        assertThat(result.getUserId()).isEqualTo(testUserId);
        verify(regionRepository).save(any(Region.class));
    }

    @Test
    void createRegion_WithInvalidGeoJson_ShouldThrowException() throws Exception {
        // Given
        when(objectMapper.writeValueAsString(any())).thenThrow(new RuntimeException("Invalid JSON"));

        // When & Then
        assertThatThrownBy(() -> regionService.createRegion(testRegionDto, testUserId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Invalid GeoJSON format");
    }

    @Test
    void getRegionById_WhenRegionExists_ShouldReturnRegion() throws Exception {
        // Given
        when(regionRepository.findById(testRegionId)).thenReturn(Optional.of(testRegion));

        // When
        Optional<RegionDto> result = regionService.getRegionById(testRegionId, testUserId);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Test Region");
        assertThat(result.get().getUserId()).isEqualTo(testUserId);
    }

    @Test
    void getRegionById_WhenRegionDoesNotExist_ShouldReturnEmpty() {
        // Given
        when(regionRepository.findById(testRegionId)).thenReturn(Optional.empty());

        // When
        Optional<RegionDto> result = regionService.getRegionById(testRegionId, testUserId);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getRegionById_WhenRegionBelongsToDifferentUser_ShouldReturnEmpty() {
        // Given
        UUID differentUserId = UUID.randomUUID();
        when(regionRepository.findById(testRegionId)).thenReturn(Optional.of(testRegion));

        // When
        Optional<RegionDto> result = regionService.getRegionById(testRegionId, differentUserId);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getRegionsByUser_ShouldReturnPaginatedRegions() throws Exception {
        // Given
        List<Region> regions = Arrays.asList(testRegion);
        Page<Region> regionPage = new PageImpl<>(regions);
        Pageable pageable = PageRequest.of(0, 10);
        
        when(regionRepository.findByUserId(testUserId, pageable)).thenReturn(regionPage);

        // When
        Page<RegionDto> result = regionService.getRegionsByUser(testUserId, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Test Region");
    }

    @Test
    void searchRegionsByName_ShouldReturnMatchingRegions() throws Exception {
        // Given
        List<Region> regions = Arrays.asList(testRegion);
        when(regionRepository.findByNameContainingIgnoreCase("Test")).thenReturn(regions);

        // When
        List<RegionDto> result = regionService.searchRegionsByName("Test");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Region");
    }

    @Test
    void updateRegion_WhenRegionExists_ShouldUpdateAndReturnRegion() throws Exception {
        // Given
        RegionDto updateDto = new RegionDto();
        updateDto.setName("Updated Region");
        updateDto.setGeoJson(createTestGeoJson());
        
        // Create a region with updated name for the mock
        Region updatedRegion = new Region();
        updatedRegion.setId(testRegionId);
        updatedRegion.setName("Updated Region");
        updatedRegion.setUserId(testUserId);
        updatedRegion.setCreatedAt(LocalDateTime.now());
        updatedRegion.setUpdatedAt(LocalDateTime.now());
        updatedRegion.setGeometry(testRegion.getGeometry());
        
        when(regionRepository.findById(testRegionId)).thenReturn(Optional.of(testRegion));
        when(regionRepository.save(any(Region.class))).thenReturn(updatedRegion);
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"type\":\"Polygon\",\"coordinates\":[[[0,0],[1,0],[1,1],[0,1],[0,0]]]}");

        // When
        Optional<RegionDto> result = regionService.updateRegion(testRegionId, updateDto, testUserId);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Updated Region");
        verify(regionRepository).save(any(Region.class));
    }

    @Test
    void updateRegion_WhenRegionDoesNotExist_ShouldReturnEmpty() {
        // Given
        when(regionRepository.findById(testRegionId)).thenReturn(Optional.empty());

        // When
        Optional<RegionDto> result = regionService.updateRegion(testRegionId, testRegionDto, testUserId);

        // Then
        assertThat(result).isEmpty();
        verify(regionRepository, never()).save(any());
    }

    @Test
    void deleteRegion_WhenRegionExists_ShouldReturnTrue() {
        // Given
        when(regionRepository.findById(testRegionId)).thenReturn(Optional.of(testRegion));

        // When
        boolean result = regionService.deleteRegion(testRegionId, testUserId);

        // Then
        assertThat(result).isTrue();
        verify(regionRepository).delete(testRegion);
    }

    @Test
    void deleteRegion_WhenRegionDoesNotExist_ShouldReturnFalse() {
        // Given
        when(regionRepository.findById(testRegionId)).thenReturn(Optional.empty());

        // When
        boolean result = regionService.deleteRegion(testRegionId, testUserId);

        // Then
        assertThat(result).isFalse();
        verify(regionRepository, never()).delete(any());
    }

    @Test
    void findRegionsWithinBounds_ShouldReturnRegionsInBounds() throws Exception {
        // Given
        List<Region> regions = Arrays.asList(testRegion);
        when(regionRepository.findRegionsWithinBounds(0.0, 0.0, 1.0, 1.0)).thenReturn(regions);

        // When
        List<RegionDto> result = regionService.findRegionsWithinBounds(0.0, 0.0, 1.0, 1.0);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Region");
    }

    @Test
    void countRegionsByUser_ShouldReturnCorrectCount() {
        // Given
        when(regionRepository.countByUserId(testUserId)).thenReturn(5L);

        // When
        long result = regionService.countRegionsByUser(testUserId);

        // Then
        assertThat(result).isEqualTo(5L);
    }

    @Test
    void existsByNameAndUser_ShouldReturnTrue_WhenRegionExists() {
        // Given
        when(regionRepository.existsByNameAndUserId("Test Region", testUserId)).thenReturn(true);

        // When
        boolean result = regionService.existsByNameAndUser("Test Region", testUserId);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void existsByNameAndUser_ShouldReturnFalse_WhenRegionDoesNotExist() {
        // Given
        when(regionRepository.existsByNameAndUserId("Test Region", testUserId)).thenReturn(false);

        // When
        boolean result = regionService.existsByNameAndUser("Test Region", testUserId);

        // Then
        assertThat(result).isFalse();
    }

    private Map<String, Object> createTestGeoJson() {
        Map<String, Object> geoJson = new HashMap<>();
        geoJson.put("type", "Polygon");
        geoJson.put("coordinates", Arrays.asList(
            Arrays.asList(Arrays.asList(0.0, 0.0), Arrays.asList(1.0, 0.0), 
                         Arrays.asList(1.0, 1.0), Arrays.asList(0.0, 1.0), Arrays.asList(0.0, 0.0))
        ));
        return geoJson;
    }
} 