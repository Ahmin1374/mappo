import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from './map.component';
import { MapService, GeoJSONFeature } from '../map.service';
import { EventEmitter } from '@angular/core';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let mapService: jasmine.SpyObj<MapService>;

  const mockGeoJSON: GeoJSONFeature = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
    },
    properties: {
      id: 'test-shape-1',
      createdAt: new Date()
    }
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('MapService', [
      'initializeMap',
      'clearAllShapes',
      'getAllShapes',
      'destroyMap'
    ], {
      onShapeCreated: new EventEmitter<GeoJSONFeature>(),
      onShapeDeleted: new EventEmitter<string>(),
      onMapInitialized: new EventEmitter<void>()
    });

    await TestBed.configureTestingModule({
      declarations: [ MapComponent ],
      providers: [
        { provide: MapService, useValue: spy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    mapService = TestBed.inject(MapService) as jasmine.SpyObj<MapService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize map on ngOnInit', () => {
      spyOn(component, 'subscribeToEvents');
      
      component.ngOnInit();
      
      expect(mapService.initializeMap).toHaveBeenCalledWith('map');
      expect(component.subscribeToEvents).toHaveBeenCalled();
    });

    it('should destroy map on ngOnDestroy', () => {
      component.ngOnDestroy();
      
      expect(mapService.destroyMap).toHaveBeenCalled();
    });

    it('should subscribe to map service events', () => {
      spyOn(component, 'handleShapeCreated');
      spyOn(component, 'handleShapeDeleted');
      spyOn(component, 'handleMapInitialized');
      
      component.subscribeToEvents();
      
      // Trigger events
      mapService.onShapeCreated.emit(mockGeoJSON);
      mapService.onShapeDeleted.emit('test-shape-1');
      mapService.onMapInitialized.emit();
      
      expect(component.handleShapeCreated).toHaveBeenCalledWith(mockGeoJSON);
      expect(component.handleShapeDeleted).toHaveBeenCalledWith('test-shape-1');
      expect(component.handleMapInitialized).toHaveBeenCalled();
    });
  });

  describe('Shape Management', () => {
    beforeEach(() => {
      component.drawnShapes = [mockGeoJSON];
    });

    it('should handle shape creation', () => {
      spyOn(console, 'log');
      spyOn(component.shapeCreated, 'emit');
      
      component.handleShapeCreated(mockGeoJSON);
      
      expect(component.drawnShapes).toContain(mockGeoJSON);
      expect(console.log).toHaveBeenCalledWith('New shape created:', mockGeoJSON);
      expect(component.shapeCreated.emit).toHaveBeenCalledWith(mockGeoJSON);
    });

    it('should handle shape deletion', () => {
      spyOn(console, 'log');
      spyOn(component.shapeDeleted, 'emit');
      
      component.handleShapeDeleted('test-shape-1');
      
      expect(component.drawnShapes.length).toBe(0);
      expect(console.log).toHaveBeenCalledWith('Shape deleted:', 'test-shape-1');
      expect(component.shapeDeleted.emit).toHaveBeenCalledWith('test-shape-1');
    });

    it('should clear all shapes', () => {
      spyOn(console, 'log');
      
      component.clearAllShapes();
      
      expect(mapService.clearAllShapes).toHaveBeenCalled();
      expect(component.drawnShapes.length).toBe(0);
      expect(console.log).toHaveBeenCalledWith('All shapes cleared');
    });

    it('should get all shapes from service', () => {
      const mockShapes = [mockGeoJSON];
      mapService.getAllShapes.and.returnValue(mockShapes);
      
      const result = component.getAllShapes();
      
      expect(mapService.getAllShapes).toHaveBeenCalled();
      expect(result).toEqual(mockShapes);
    });
  });

  describe('Map Status', () => {
    it('should return correct map initialization status', () => {
      component['mapInitializedFlag'] = true;
      expect(component.isMapInitialized()).toBe(true);
      
      component['mapInitializedFlag'] = false;
      expect(component.isMapInitialized()).toBe(false);
    });

    it('should return correct shape count', () => {
      component.drawnShapes = [mockGeoJSON, { ...mockGeoJSON, properties: { ...mockGeoJSON.properties, id: 'test-shape-2' } }];
      
      expect(component.getShapeCount()).toBe(2);
    });

    it('should return zero shape count when no shapes', () => {
      component.drawnShapes = [];
      
      expect(component.getShapeCount()).toBe(0);
    });
  });

  describe('Event Handling', () => {
    it('should handle map initialization', () => {
      spyOn(console, 'log');
      spyOn(component.mapInitialized, 'emit');
      
      component.handleMapInitialized();
      
      expect(console.log).toHaveBeenCalledWith('Map initialized successfully');
      expect(component.mapInitialized.emit).toHaveBeenCalled();
    });

    it('should emit shape created event', () => {
      spyOn(component.shapeCreated, 'emit');
      
      component.handleShapeCreated(mockGeoJSON);
      
      expect(component.shapeCreated.emit).toHaveBeenCalledWith(mockGeoJSON);
    });

    it('should emit shape deleted event', () => {
      spyOn(component.shapeDeleted, 'emit');
      
      component.handleShapeDeleted('test-shape-1');
      
      expect(component.shapeDeleted.emit).toHaveBeenCalledWith('test-shape-1');
    });
  });

  describe('Error Handling', () => {
    it('should handle map initialization errors gracefully', () => {
      spyOn(console, 'error');
      mapService.initializeMap.and.throwError('Map initialization failed');
      
      component.initializeMap();
      
      expect(console.error).toHaveBeenCalledWith('Failed to initialize map:', jasmine.any(Error));
    });
  });

  describe('Component Properties', () => {
    it('should have correct initial values', () => {
      expect(component.drawnShapes).toEqual([]);
      expect(component['mapInitializedFlag']).toBe(false);
    });

    it('should have event emitters', () => {
      expect(component.shapeCreated).toBeDefined();
      expect(component.shapeDeleted).toBeDefined();
      expect(component.mapInitialized).toBeDefined();
    });
  });

  describe('Template Integration', () => {
    it('should have map container reference', () => {
      expect(component.mapContainer).toBeDefined();
    });

    it('should display correct status in template', () => {
      component['mapInitializedFlag'] = true;
      component.drawnShapes = [mockGeoJSON];
      
      fixture.detectChanges();
      
      expect(component.isMapInitialized()).toBe(true);
      expect(component.getShapeCount()).toBe(1);
    });
  });
});
