import { Injectable, EventEmitter } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { RegionService, RegionDto } from '../../services/region.service';
import { Observable } from 'rxjs';

// Test if Leaflet is loaded
console.log('🗺️ Leaflet loaded:', typeof L);
console.log('🗺️ Leaflet version:', L.version);
console.log('🗺️ Leaflet map function:', typeof L.map);

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'Rectangle';
    coordinates: number[][][];
  };
  properties: {
    id: string;
    name?: string;
    createdAt: Date;
  };
}

export interface MapConfig {
  center: [number, number]; // [lat, lng]
  zoom: number;
  minZoom: number;
  maxZoom: number;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map: L.Map | null = null;
  private drawControl: L.Control.Draw | null = null;
  private drawnItems: L.FeatureGroup = new L.FeatureGroup();
  private regionLayers: Map<string, L.Layer> = new Map(); // Track region layers by ID
  
  // Events
  public onShapeCreated = new EventEmitter<GeoJSONFeature>();
  public onShapeDeleted = new EventEmitter<string>();
  public onMapInitialized = new EventEmitter<void>();
  public onRegionsLoaded = new EventEmitter<RegionDto[]>();

  // Default configuration for Germany
  private defaultConfig: MapConfig = {
    center: [51.1657, 10.4515], // Center of Germany
    zoom: 6,
    minZoom: 4,
    maxZoom: 18
  };

  constructor(private regionService: RegionService) {}

  /**
   * Initialize the map in the specified container
   */
  public initializeMap(containerId: string, config?: Partial<MapConfig>): L.Map {
    console.log('🗺️ MapService: Starting map initialization...');
    console.log('🗺️ Container ID:', containerId);
    
    const finalConfig = { ...this.defaultConfig, ...config };
    console.log('🗺️ Final config:', finalConfig);
    
    // Create map instance
    this.map = L.map(containerId, {
      center: finalConfig.center,
      zoom: finalConfig.zoom,
      minZoom: finalConfig.minZoom,
      maxZoom: finalConfig.maxZoom
    });
    
    console.log('🗺️ Map instance created:', this.map);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    console.log('🗺️ Tile layer added');

    // Initialize drawing controls
    this.initializeDrawControls();
    console.log('🗺️ Drawing controls initialized');

    // Load existing regions
    this.loadRegions();
    console.log('🗺️ Regions loading initiated');

    // Emit initialization event
    this.onMapInitialized.emit();
    console.log('🗺️ Map initialization event emitted');

    return this.map;
  }

  /**
   * Initialize drawing controls for polygons and rectangles
   */
  private initializeDrawControls(): void {
    if (!this.map) return;

    // Add drawn items layer
    this.map.addLayer(this.drawnItems);

    // Configure draw options
    const drawOptions: L.Control.DrawConstructorOptions = {
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Error:</strong> Shape edges cannot cross!'
          },
          shapeOptions: {
            color: '#3388ff',
            fillColor: '#3388ff',
            fillOpacity: 0.2
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#3388ff',
            fillColor: '#3388ff',
            fillOpacity: 0.2
          }
        },
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false
      },
      edit: {
        featureGroup: this.drawnItems,
        remove: true
      }
    };

    // Create and add draw control
    this.drawControl = new L.Control.Draw(drawOptions);
    this.map.addControl(this.drawControl);

    // Bind events
    this.map.on(L.Draw.Event.CREATED, (event: any) => {
      this.handleShapeCreated(event);
    });

    this.map.on(L.Draw.Event.DELETED, (event: any) => {
      this.handleShapeDeleted(event);
    });
  }

  /**
   * Handle shape creation and convert to GeoJSON
   */
  private handleShapeCreated(event: any): void {
    const layer = event.layer;
    this.drawnItems.addLayer(layer);

    // Convert to GeoJSON
    const geoJSON = this.convertLayerToGeoJSON(layer);
    if (geoJSON) {
      this.onShapeCreated.emit(geoJSON);
    }
  }

  /**
   * Handle shape deletion
   */
  private handleShapeDeleted(event: any): void {
    event.layers.eachLayer((layer: L.Layer) => {
      // Extract ID from layer if available
      const layerId = (layer as any).options?.id || 'unknown';
      this.onShapeDeleted.emit(layerId);
    });
  }

  /**
   * Convert Leaflet layer to GeoJSON format
   */
  private convertLayerToGeoJSON(layer: L.Layer): GeoJSONFeature | null {
    try {
      const geoJSON = (layer as any).toGeoJSON();
      
      if (geoJSON && geoJSON.features && geoJSON.features.length > 0) {
        const feature = geoJSON.features[0];
        
        // Determine shape type
        let shapeType: 'Polygon' | 'Rectangle' = 'Polygon';
        if (feature.geometry.type === 'Polygon') {
          // Check if it's a rectangle by examining coordinates
          const coords = feature.geometry.coordinates[0];
          if (coords.length === 5 && this.isRectangle(coords)) {
            shapeType = 'Rectangle';
          }
        }

        return {
          type: 'Feature',
          geometry: {
            type: shapeType,
            coordinates: feature.geometry.coordinates
          },
          properties: {
            id: this.generateId(),
            createdAt: new Date()
          }
        };
      }
    } catch (error) {
      console.error('Error converting layer to GeoJSON:', error);
    }
    
    return null;
  }

  /**
   * Check if polygon coordinates form a rectangle
   */
  private isRectangle(coords: number[][]): boolean {
    if (coords.length !== 5) return false; // Rectangle has 5 points (first and last are same)
    
    // Check if opposite sides are parallel (simplified check)
    const [x1, y1] = coords[0];
    const [x2, y2] = coords[1];
    const [x3, y3] = coords[2];
    const [x4, y4] = coords[3];
    
    // Check if first and last points are the same (closed polygon)
    return Math.abs(x1 - x4) < 0.0001 && Math.abs(y1 - y4) < 0.0001;
  }

  /**
   * Generate unique ID for shapes
   */
  private generateId(): string {
    return `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load regions from backend and display them on the map
   */
  public loadRegions(): void {
    this.regionService.getRegions().subscribe({
      next: (response) => {
        this.displayRegions(response.content);
        this.onRegionsLoaded.emit(response.content);
      },
      error: (error) => {
        console.error('Error loading regions:', error);
      }
    });
  }

  /**
   * Display regions on the map
   */
  private displayRegions(regions: RegionDto[]): void {
    regions.forEach(region => {
      if (region.geoJson && region.geoJson.coordinates) {
        const layer = this.createLayerFromGeoJSON(region.geoJson, region);
        if (layer) {
          this.drawnItems.addLayer(layer);
          this.regionLayers.set(region.id!, layer);
        }
      }
    });
  }

  /**
   * Create a Leaflet layer from GeoJSON
   */
  private createLayerFromGeoJSON(geoJson: any, region: RegionDto): L.Layer | null {
    try {
      const layer = L.geoJSON(geoJson as any, {
        style: {
          color: '#3388ff',
          fillColor: '#3388ff',
          fillOpacity: 0.2,
          weight: 2
        },
        onEachFeature: (feature, layer) => {
          if (region.name) {
            layer.bindPopup(`<b>${region.name}</b><br>Created: ${region.createdAt}`);
          }
        }
      });
      return layer;
    } catch (error) {
      console.error('Error creating layer from GeoJSON:', error);
      return null;
    }
  }

  /**
   * Save a drawn shape to the backend
   */
  public saveRegion(feature: GeoJSONFeature, name: string): Observable<RegionDto> {
    const regionDto: RegionDto = {
      name: name,
      geoJson: feature.geometry
    };

    return this.regionService.createRegion(regionDto);
  }

  /**
   * Delete a region from the backend
   */
  public deleteRegion(regionId: string): Observable<void> {
    return this.regionService.deleteRegion(regionId);
  }

  /**
   * Load regions within current map bounds
   */
  public loadRegionsInBounds(): void {
    if (!this.map) return;

    const bounds = this.map.getBounds();
    this.regionService.getRegionsInBounds(
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ).subscribe({
      next: (regions) => {
        this.displayRegions(regions);
      },
      error: (error) => {
        console.error('Error loading regions in bounds:', error);
      }
    });
  }

  /**
   * Get all drawn shapes as GeoJSON
   */
  public getAllShapes(): GeoJSONFeature[] {
    const shapes: GeoJSONFeature[] = [];
    
    this.drawnItems.eachLayer((layer: L.Layer) => {
      const geoJSON = this.convertLayerToGeoJSON(layer);
      if (geoJSON) {
        shapes.push(geoJSON);
      }
    });
    
    return shapes;
  }

  /**
   * Clear all drawn shapes
   */
  public clearAllShapes(): void {
    this.drawnItems.clearLayers();
  }

  /**
   * Get map instance (for advanced operations)
   */
  public getMap(): L.Map | null {
    return this.map;
  }

  /**
   * Destroy map instance
   */
  public destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.drawControl = null;
    }
  }
}
