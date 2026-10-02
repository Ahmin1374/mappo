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
     * Find regions within a bounding box using native SQL for PostGIS
     */
    @Query(value = "SELECT * FROM regions WHERE ST_Within(geom, ST_MakeEnvelope(:minX, :minY, :maxX, :maxY, 4326))", nativeQuery = true)
    List<Region> findRegionsWithinBounds(
        @Param("minX") double minX, 
        @Param("minY") double minY, 
        @Param("maxX") double maxX, 
        @Param("maxY") double maxY
    );
    
    /**
     * Find regions that intersect with a given polygon using native SQL
     */
    @Query(value = "SELECT * FROM regions WHERE ST_Intersects(geom, ST_GeomFromText(:polygonWkt, 4326))", nativeQuery = true)
    List<Region> findRegionsIntersectingPolygon(@Param("polygonWkt") String polygonWkt);
    
    /**
     * Find regions within a certain distance from a point using native SQL
     */
    @Query(value = "SELECT * FROM regions WHERE ST_DWithin(geom, ST_SetSRID(ST_Point(:longitude, :latitude), 4326), :distance)", nativeQuery = true)
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