import { TestBed } from '@angular/core/testing';
import { MapService, GeoJSONFeature } from './map.service';
import { RegionService, RegionDto } from '../../services/region.service';
import { of, throwError } from 'rxjs';

describe('MapService', () => {
  let service: MapService;
  let regionService: jasmine.SpyObj<RegionService>;

  const mockRegion: RegionDto = {
    id: '123',
    name: 'Test Region',
    geoJson: {
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
    },
    userId: 'user123',
    createdAt: '2025-07-28T10:00:00Z',
    updatedAt: '2025-07-28T10:00:00Z'
  };

  const mockGeoJSONFeature: GeoJSONFeature = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
    },
    properties: {
      id: 'shape_123',
      createdAt: new Date()
    }
  };

  beforeEach(() => {
    const regionServiceSpy = jasmine.createSpyObj('RegionService', [
      'getRegions',
      'createRegion',
      'deleteRegion',
      'getRegionsInBounds'
    ]);

    TestBed.configureTestingModule({
      providers: [
        MapService,
        { provide: RegionService, useValue: regionServiceSpy }
      ]
    });
    service = TestBed.inject(MapService);
    regionService = TestBed.inject(RegionService) as jasmine.SpyObj<RegionService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadRegions', () => {
    it('should load regions from backend and emit event', () => {
      const mockResponse = {
        content: [mockRegion],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0
      };

      regionService.getRegions.and.returnValue(of(mockResponse));

      let emittedRegions: RegionDto[] = [];
      service.onRegionsLoaded.subscribe(regions => {
        emittedRegions = regions;
      });

      service.loadRegions();

      expect(regionService.getRegions).toHaveBeenCalled();
      expect(emittedRegions).toEqual([mockRegion]);
    });

    it('should handle error when loading regions fails', () => {
      const error = new Error('Failed to load regions');
      regionService.getRegions.and.returnValue(throwError(() => error));

      spyOn(console, 'error');

      service.loadRegions();

      expect(console.error).toHaveBeenCalledWith('Error loading regions:', error);
    });
  });

  describe('saveRegion', () => {
    it('should save a region to backend', () => {
      regionService.createRegion.and.returnValue(of(mockRegion));

      service.saveRegion(mockGeoJSONFeature, 'Test Region').subscribe(region => {
        expect(region).toEqual(mockRegion);
      });

      expect(regionService.createRegion).toHaveBeenCalledWith({
        name: 'Test Region',
        geoJson: mockGeoJSONFeature.geometry
      });
    });
  });

  describe('deleteRegion', () => {
    it('should delete a region from backend', () => {
      regionService.deleteRegion.and.returnValue(of(void 0));

      service.deleteRegion('123').subscribe(() => {
        // Should complete without error
      });

      expect(regionService.deleteRegion).toHaveBeenCalledWith('123');
    });
  });

  describe('loadRegionsInBounds', () => {
    it('should load regions within map bounds', () => {
      regionService.getRegionsInBounds.and.returnValue(of([mockRegion]));

      // Mock map bounds
      const mockMap = {
        getBounds: () => ({
          getWest: () => 0,
          getSouth: () => 0,
          getEast: () => 1,
          getNorth: () => 1
        })
      };

      // Set the map instance
      (service as any).map = mockMap;

      spyOn(console, 'error');

      service.loadRegionsInBounds();

      expect(regionService.getRegionsInBounds).toHaveBeenCalledWith(0, 0, 1, 1);
    });

    it('should handle error when loading regions in bounds fails', () => {
      const error = new Error('Failed to load regions in bounds');
      regionService.getRegionsInBounds.and.returnValue(throwError(() => error));

      const mockMap = {
        getBounds: () => ({
          getWest: () => 0,
          getSouth: () => 0,
          getEast: () => 1,
          getNorth: () => 1
        })
      };

      (service as any).map = mockMap;
      spyOn(console, 'error');

      service.loadRegionsInBounds();

      expect(console.error).toHaveBeenCalledWith('Error loading regions in bounds:', error);
    });

    it('should not call service when map is not initialized', () => {
      (service as any).map = null;

      service.loadRegionsInBounds();

      expect(regionService.getRegionsInBounds).not.toHaveBeenCalled();
    });
  });

  describe('getAllShapes', () => {
    it('should return empty array when no shapes are drawn', () => {
      const shapes = service.getAllShapes();
      expect(shapes).toEqual([]);
    });
  });

  describe('clearAllShapes', () => {
    it('should clear all drawn shapes', () => {
      // This test verifies the method exists and doesn't throw
      expect(() => service.clearAllShapes()).not.toThrow();
    });
  });

  describe('getMap', () => {
    it('should return null when map is not initialized', () => {
      expect(service.getMap()).toBeNull();
    });
  });

  describe('destroyMap', () => {
    it('should destroy map instance', () => {
      // This test verifies the method exists and doesn't throw
      expect(() => service.destroyMap()).not.toThrow();
    });
  });
});
