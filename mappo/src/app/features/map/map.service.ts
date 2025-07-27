import { Injectable, EventEmitter } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';

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
  
  // Events
  public onShapeCreated = new EventEmitter<GeoJSONFeature>();
  public onShapeDeleted = new EventEmitter<string>();
  public onMapInitialized = new EventEmitter<void>();

  // Default configuration for Germany
  private defaultConfig: MapConfig = {
    center: [51.1657, 10.4515], // Center of Germany
    zoom: 6,
    minZoom: 4,
    maxZoom: 18
  };

  constructor() {}

  /**
   * Initialize the map in the specified container
   */
  public initializeMap(containerId: string, config?: Partial<MapConfig>): L.Map {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    // Create map instance
    this.map = L.map(containerId, {
      center: finalConfig.center,
      zoom: finalConfig.zoom,
      minZoom: finalConfig.minZoom,
      maxZoom: finalConfig.maxZoom
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Initialize drawing controls
    this.initializeDrawControls();

    // Emit initialization event
    this.onMapInitialized.emit();

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
