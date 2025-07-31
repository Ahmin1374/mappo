package com.mappo.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mappo.backend.dto.RegionDto;
import com.mappo.backend.model.User;
import com.mappo.backend.security.SecurityUtils;
import com.mappo.backend.service.RegionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegionControllerTest {

    @Mock
    private RegionService regionService;

    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private RegionController regionController;

    private UUID testUserId;
    private UUID testRegionId;
    private RegionDto testRegionDto;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testRegionId = UUID.randomUUID();
        
        testUser = new User();
        testUser.setId(testUserId);
        testUser.setUsername("testuser");
        
        testRegionDto = new RegionDto();
        testRegionDto.setId(testRegionId);
        testRegionDto.setName("Test Region");
        testRegionDto.setUserId(testUserId);
        testRegionDto.setGeoJson(createTestGeoJson());
        testRegionDto.setCreatedAt("2025-07-27T10:00:00");
        testRegionDto.setUpdatedAt("2025-07-27T10:00:00");
    }

    @Test
    void createRegion_WithValidData_ShouldReturnCreatedRegion() {
        // Given
        when(securityUtils.getCurrentUser()).thenReturn(Optional.of(testUser));
        when(regionService.createRegion(any(RegionDto.class), any(UUID.class)))
                .thenReturn(testRegionDto);

        // When
        ResponseEntity<RegionDto> response = regionController.createRegion(testRegionDto);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("Test Region");
        assertThat(response.getBody().getId()).isEqualTo(testRegionId);
        
        verify(regionService).createRegion(eq(testRegionDto), any(UUID.class));
    }

    @Test
    void getRegion_WhenRegionExists_ShouldReturnRegion() {
        // Given
        when(securityUtils.getCurrentUser()).thenReturn(Optional.of(testUser));
        when(regionService.getRegionById(eq(testRegionId), any(UUID.class)))
                .thenReturn(Optional.of(testRegionDto));

        // When
        ResponseEntity<RegionDto> response = regionController.getRegion(testRegionId);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("Test Region");
        
        verify(regionService).getRegionById(eq(testRegionId), any(UUID.class));
    }

    @Test
    void getRegion_WhenRegionDoesNotExist_ShouldReturnNotFound() {
        // Given
        when(securityUtils.getCurrentUser()).thenReturn(Optional.of(testUser));
        when(regionService.getRegionById(eq(testRegionId), any(UUID.class)))
                .thenReturn(Optional.empty());

        // When
        ResponseEntity<RegionDto> response = regionController.getRegion(testRegionId);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();
        
        verify(regionService).getRegionById(eq(testRegionId), any(UUID.class));
    }

    @Test
    void getRegions_ShouldReturnPaginatedRegions() {
        // Given
        when(securityUtils.getCurrentUser()).thenReturn(Optional.of(testUser));
        Pageable pageable = PageRequest.of(0, 10);
        Page<RegionDto> regionPage = new PageImpl<>(Arrays.asList(testRegionDto), pageable, 1);
        
        when(regionService.getRegionsByUser(any(UUID.class), any(Pageable.class)))
                .thenReturn(regionPage);

        // When
        ResponseEntity<Page<RegionDto>> response = regionController.getRegions(pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getContent()).hasSize(1);
        assertThat(response.getBody().getContent().get(0).getName()).isEqualTo("Test Region");
        
        verify(regionService).getRegionsByUser(any(UUID.class), eq(pageable));
    }

    @Test
    void searchRegions_ShouldReturnMatchingRegions() {
        // Given
        List<RegionDto> regions = Arrays.asList(testRegionDto);
        when(regionService.searchRegionsByName("Test")).thenReturn(regions);

        // When
        ResponseEntity<List<RegionDto>> response = regionController.searchRegions("Test");

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getName()).isEqualTo("Test Region");
        
        verify(regionService).searchRegionsByName("Test");
    }

    @Test
    void getRegionsInBounds_ShouldReturnRegionsInBounds() {
        // Given
        List<RegionDto> regions = Arrays.asList(testRegionDto);
        when(regionService.findRegionsWithinBounds(0.0, 0.0, 1.0, 1.0)).thenReturn(regions);

        // When
        ResponseEntity<List<RegionDto>> response = regionController.getRegionsInBounds(0.0, 0.0, 1.0, 1.0);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getName()).isEqualTo("Test Region");
        
        verify(regionService).findRegionsWithinBounds(0.0, 0.0, 1.0, 1.0);
    }

    @Test
    void updateRegion_WhenRegionExists_ShouldReturnUpdatedRegion() {
        // Given
        when(securityUtils.getCurrentUser()).thenReturn(Optional.of(testUser));
        RegionDto updateDto = new RegionDto();
        updateDto.setName("Updated Region");
        updateDto.setGeoJson(createTestGeoJson());
        
        when(regionService.updateRegion(eq(testRegionId), eq(updateDto), any(UUID.class)))
                .thenReturn(Optional.of(testRegionDto));

        // When
        ResponseEntity<RegionDto> response = regionController.updateRegion(testRegionId, updateDto);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("Test Region");
        
        verify(regionService).updateRegion(eq(testRegionId), eq(updateDto), any(UUID.class));
    }

    @Test
    void updateRegion_WhenRegionDoesNotExist_ShouldReturnNotFound() {
        // Given
        when(securityUtils.getCurrentUser()).thenReturn(Optional.of(testUser));
        when(regionService.updateRegion(eq(testRegionId), eq(testRegionDto), any(UUID.class)))
                .thenReturn(Optional.empty());

        // When
        ResponseEntity<RegionDto> response = regionController.updateRegion(testRegionId, testRegionDto);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();
        
        verify(regionService).updateRegion(eq(testRegionId), eq(testRegionDto), any(UUID.class));
    }

    @Test
    void deleteRegion_WhenRegionExists_ShouldReturnNoContent() {
        // Given
        when(securityUtils.getCurrentUser()).thenReturn(Optional.of(testUser));
        when(regionService.deleteRegion(eq(testRegionId), any(UUID.class))).thenReturn(true);

        // When
        ResponseEntity<Void> response = regionController.deleteRegion(testRegionId);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        
        verify(regionService).deleteRegion(eq(testRegionId), any(UUID.class));
    }

    @Test
    void deleteRegion_WhenRegionDoesNotExist_ShouldReturnNotFound() {
        // Given
        when(securityUtils.getCurrentUser()).thenReturn(Optional.of(testUser));
        when(regionService.deleteRegion(eq(testRegionId), any(UUID.class))).thenReturn(false);

        // When
        ResponseEntity<Void> response = regionController.deleteRegion(testRegionId);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        
        verify(regionService).deleteRegion(eq(testRegionId), any(UUID.class));
    }

    @Test
    void getRegionCount_ShouldReturnCorrectCount() {
        // Given
        when(securityUtils.getCurrentUser()).thenReturn(Optional.of(testUser));
        when(regionService.countRegionsByUser(any(UUID.class))).thenReturn(1L);

        // When
        ResponseEntity<Long> response = regionController.getRegionCount();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(1L);
        
        verify(regionService).countRegionsByUser(any(UUID.class));
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