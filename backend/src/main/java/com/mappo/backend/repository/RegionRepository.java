package com.mappo.backend.repository;

import com.mappo.backend.model.Region;
import org.locationtech.jts.geom.Polygon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RegionRepository extends JpaRepository<Region, UUID> {
    
    /**
     * Find regions by user ID
     */
    Page<Region> findByUserId(UUID userId, Pageable pageable);
    
    /**
     * Find regions by name (case-insensitive)
     */
    List<Region> findByNameContainingIgnoreCase(String name);
    
    /**
     * Find regions within a bounding box
     */
    @Query("SELECT r FROM Region r WHERE ST_Within(r.geometry, ST_MakeEnvelope(:minX, :minY, :maxX, :maxY, 4326))")
    List<Region> findRegionsWithinBounds(
        @Param("minX") double minX, 
        @Param("minY") double minY, 
        @Param("maxX") double maxX, 
        @Param("maxY") double maxY
    );
    
    /**
     * Find regions that intersect with a given polygon
     */
    @Query("SELECT r FROM Region r WHERE ST_Intersects(r.geometry, :polygon)")
    List<Region> findRegionsIntersectingPolygon(@Param("polygon") Polygon polygon);
    
    /**
     * Find regions within a certain distance from a point
     */
    @Query("SELECT r FROM Region r WHERE ST_DWithin(r.geometry, ST_Point(:longitude, :latitude), :distance)")
    List<Region> findRegionsWithinDistance(
        @Param("longitude") double longitude,
        @Param("latitude") double latitude,
        @Param("distance") double distance
    );
    
    /**
     * Count regions by user ID
     */
    long countByUserId(UUID userId);
    
    /**
     * Check if a region with the given name exists for a user
     */
    boolean existsByNameAndUserId(String name, UUID userId);
} 