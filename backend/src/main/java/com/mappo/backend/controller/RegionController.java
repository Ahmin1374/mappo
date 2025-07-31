package com.mappo.backend.controller;

import com.mappo.backend.dto.RegionDto;
import com.mappo.backend.security.SecurityUtils;
import com.mappo.backend.service.RegionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/regions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RegionController {
    
    private final RegionService regionService;
    private final SecurityUtils securityUtils;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER')")
    public ResponseEntity<RegionDto> createRegion(@Valid @RequestBody RegionDto regionDto) {
        UUID userId = getCurrentUserId();
        RegionDto createdRegion = regionService.createRegion(regionDto, userId);
        return ResponseEntity.ok(createdRegion);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RegionDto> getRegion(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        return regionService.getRegionById(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    public ResponseEntity<Page<RegionDto>> getRegions(Pageable pageable) {
        UUID userId = getCurrentUserId();
        Page<RegionDto> regions = regionService.getRegionsByUser(userId, pageable);
        return ResponseEntity.ok(regions);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<RegionDto>> searchRegions(@RequestParam String name) {
        List<RegionDto> regions = regionService.searchRegionsByName(name);
        return ResponseEntity.ok(regions);
    }
    
    @GetMapping("/bounds")
    public ResponseEntity<List<RegionDto>> getRegionsInBounds(
            @RequestParam double minX,
            @RequestParam double minY,
            @RequestParam double maxX,
            @RequestParam double maxY) {
        List<RegionDto> regions = regionService.findRegionsWithinBounds(minX, minY, maxX, maxY);
        return ResponseEntity.ok(regions);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER')")
    public ResponseEntity<RegionDto> updateRegion(@PathVariable UUID id, @Valid @RequestBody RegionDto regionDto) {
        UUID userId = getCurrentUserId();
        return regionService.updateRegion(id, regionDto, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER')")
    public ResponseEntity<Void> deleteRegion(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        boolean deleted = regionService.deleteRegion(id, userId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
    
    @GetMapping("/count")
    public ResponseEntity<Long> getRegionCount() {
        UUID userId = getCurrentUserId();
        long count = regionService.countRegionsByUser(userId);
        return ResponseEntity.ok(count);
    }
    
    private UUID getCurrentUserId() {
        return securityUtils.getCurrentUser()
                .map(user -> user.getId())
                .orElseThrow(() -> new RuntimeException("User not authenticated"));
    }
} 