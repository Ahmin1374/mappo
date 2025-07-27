import { TestBed } from '@angular/core/testing';
import { MapService, GeoJSONFeature, MapConfig } from './map.service';

describe('MapService', () => {
  let service: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapService]
    });
    service = TestBed.inject(MapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Map Initialization', () => {
    it('should initialize map with default configuration', () => {
      const containerId = 'test-container';
      const map = service.initializeMap(containerId);
      
      expect(map).toBeTruthy();
      expect(map.getCenter().lat).toBeCloseTo(51.1657, 1); // Germany center
      expect(map.getCenter().lng).toBeCloseTo(10.4515, 1);
      expect(map.getZoom()).toBe(6);
    });

    it('should initialize map with custom configuration', () => {
      const containerId = 'test-container';
      const customConfig: Partial<MapConfig> = {
        center: [52.5200, 13.4050], // Berlin
        zoom: 10
      };
      
      const map = service.initializeMap(containerId, customConfig);
      
      expect(map.getCenter().lat).toBeCloseTo(52.5200, 1);
      expect(map.getCenter().lng).toBeCloseTo(13.4050, 1);
      expect(map.getZoom()).toBe(10);
    });

    it('should emit map initialized event', (done) => {
      service.onMapInitialized.subscribe(() => {
        expect(true).toBe(true);
        done();
      });
      
      service.initializeMap('test-container');
    });
  });

  describe('Shape Management', () => {
    beforeEach(() => {
      service.initializeMap('test-container');
    });

    it('should start with zero shapes', () => {
      const shapes = service.getAllShapes();
      expect(shapes.length).toBe(0);
    });

    it('should clear all shapes', () => {
      service.clearAllShapes();
      const shapes = service.getAllShapes();
      expect(shapes.length).toBe(0);
    });

    it('should get map instance', () => {
      const map = service.getMap();
      expect(map).toBeTruthy();
    });
  });

  describe('GeoJSON Conversion', () => {
    it('should generate valid GeoJSON structure', () => {
      const mockLayer = {
        toGeoJSON: () => ({
          features: [{
            geometry: {
              type: 'Polygon',
              coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
            }
          }]
        })
      } as any;

      // Access private method through any type
      const result = (service as any).convertLayerToGeoJSON(mockLayer);
      
      expect(result).toBeTruthy();
      expect(result.type).toBe('Feature');
      expect(result.geometry.type).toBe('Polygon');
      expect(result.geometry.coordinates).toBeDefined();
      expect(result.properties.id).toBeDefined();
      expect(result.properties.createdAt).toBeDefined();
    });

    it('should handle invalid layer gracefully', () => {
      const mockLayer = {
        toGeoJSON: () => null
      } as any;

      const result = (service as any).convertLayerToGeoJSON(mockLayer);
      expect(result).toBeNull();
    });

    it('should identify rectangles correctly', () => {
      const rectangleCoords = [
        [0, 0], [1, 0], [1, 1], [0, 1], [0, 0] // Rectangle coordinates
      ];
      
      const isRect = (service as any).isRectangle(rectangleCoords);
      expect(isRect).toBe(true);
    });

    it('should identify non-rectangles correctly', () => {
      const polygonCoords = [
        [0, 0], [1, 0], [0.5, 1], [0, 0] // Triangle coordinates
      ];
      
      const isRect = (service as any).isRectangle(polygonCoords);
      expect(isRect).toBe(false);
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      service.initializeMap('test-container');
    });

    it('should emit shape created event', (done) => {
      service.onShapeCreated.subscribe((geoJSON: GeoJSONFeature) => {
        expect(geoJSON).toBeDefined();
        expect(geoJSON.type).toBe('Feature');
        done();
      });

      // Simulate shape creation event
      const mockEvent = {
        layer: {
          toGeoJSON: () => ({
            features: [{
              geometry: {
                type: 'Polygon',
                coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
              }
            }]
          })
        }
      } as any;

      (service as any).handleShapeCreated(mockEvent);
    });

    it('should emit shape deleted event', (done) => {
      service.onShapeDeleted.subscribe((shapeId: string) => {
        expect(shapeId).toBeDefined();
        done();
      });

      // Simulate shape deletion event
      const mockEvent = {
        layers: {
          eachLayer: (callback: Function) => {
            callback({ options: { id: 'test-shape-id' } });
          }
        }
      } as any;

      (service as any).handleShapeDeleted(mockEvent);
    });
  });

  describe('ID Generation', () => {
    it('should generate unique IDs', () => {
      const id1 = (service as any).generateId();
      const id2 = (service as any).generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^shape_\d+_[a-z0-9]+$/);
    });
  });

  describe('Map Destruction', () => {
    it('should destroy map properly', () => {
      service.initializeMap('test-container');
      expect(service.getMap()).toBeTruthy();
      
      service.destroyMap();
      expect(service.getMap()).toBeNull();
    });
  });

  describe('Default Configuration', () => {
    it('should have correct default configuration', () => {
      const defaultConfig = (service as any).defaultConfig;
      
      expect(defaultConfig.center).toEqual([51.1657, 10.4515]); // Germany center
      expect(defaultConfig.zoom).toBe(6);
      expect(defaultConfig.minZoom).toBe(4);
      expect(defaultConfig.maxZoom).toBe(18);
    });
  });
});
