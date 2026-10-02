import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MapComponent } from './map.component';
import { MapService, GeoJSONFeature } from '../map.service';
import { RegionService, RegionDto } from '../../../services/region.service';
import { RoleService } from '../../../services/role.service';
import { SharedModule } from '../../../shared/shared.module';
import { EventEmitter } from '@angular/core';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let mapService: jasmine.SpyObj<MapService>;
  let regionService: jasmine.SpyObj<RegionService>;
  let roleService: jasmine.SpyObj<RoleService>;

  const mockGeoJSON: GeoJSONFeature = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
    },
    properties: {
      id: 'test-shape-1',
      name: 'Test Shape',
      createdAt: new Date()
    }
  };

  const mockRegion: RegionDto = {
    id: 'test-region-1',
    name: 'Test Region',
    geoJson: {
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
    },
    userId: 'testuser',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(async () => {
    const mapServiceSpy = jasmine.createSpyObj('MapService', [
      'initializeMap', 'clearAllShapes', 'getAllShapes', 'destroyMap',
      'saveRegion', 'loadRegions', 'loadRegionsInBounds', 'isMapInitialized'
    ], {
      onShapeCreated: new EventEmitter<GeoJSONFeature>(),
      onShapeDeleted: new EventEmitter<string>(),
      onMapInitialized: new EventEmitter<void>(),
      onRegionsLoaded: new EventEmitter<RegionDto[]>()
    });

    const regionServiceSpy = jasmine.createSpyObj('RegionService', [
      'getRegions', 'createRegion', 'deleteRegion', 'getRegionsInBounds'
    ]);

    const roleServiceSpy = jasmine.createSpyObj('RoleService', [
      'hasRole', 'hasPermission', 'canCreateRegion', 'canUpdateRegion', 'canDeleteRegion',
      'isAdmin', 'isBroker', 'isViewer', 'isAdminOrBroker', 'getCurrentUserRole', 'getRoleDisplayName'
    ]);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SharedModule],
      declarations: [MapComponent],
      providers: [
        { provide: MapService, useValue: mapServiceSpy },
        { provide: RegionService, useValue: regionServiceSpy },
        { provide: RoleService, useValue: roleServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    mapService = TestBed.inject(MapService) as jasmine.SpyObj<MapService>;
    regionService = TestBed.inject(RegionService) as jasmine.SpyObj<RegionService>;
    roleService = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize map on ngOnInit', () => {
    spyOn(component, 'initializeMap');
    spyOn(component, 'subscribeToEvents');

    component.ngOnInit();

    expect(component.initializeMap).toHaveBeenCalled();
    expect(component.subscribeToEvents).toHaveBeenCalled();
  });

  it('should handle regions loaded', () => {
    const mockRegions = [mockRegion];
    
    component.handleRegionsLoaded(mockRegions);

    expect(component.regions).toEqual(mockRegions);
    expect(component.errorMessage).toBe('');
  });

  it('should save shape to backend', () => {
    const feature = mockGeoJSON;
    const name = 'Test Region';
    
    mapService.saveRegion.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));

    component.saveShapeToBackend(feature, name);

    expect(mapService.saveRegion).toHaveBeenCalledWith(feature, name);
  });

  it('should load regions in bounds', () => {
    component.loadRegionsInBounds();

    expect(mapService.loadRegionsInBounds).toHaveBeenCalled();
  });

  it('should clear all shapes', () => {
    component.clearAllShapes();

    expect(mapService.clearAllShapes).toHaveBeenCalled();
  });

  it('should get shape count', () => {
    const mockShapes = [mockGeoJSON];
    mapService.getAllShapes.and.returnValue(mockShapes);

    const result = component.getShapeCount();

    expect(result).toBe(1);
    expect(mapService.getAllShapes).toHaveBeenCalled();
  });

  it('should get region count', () => {
    component.regions = [mockRegion, { ...mockRegion, id: 'test-region-2' }];

    const result = component.getRegionCount();

    expect(result).toBe(2);
  });

  it('should check if map is initialized', () => {
    mapService.isMapInitialized.and.returnValue(true);

    const result = component.isMapInitialized();

    expect(result).toBe(true);
    expect(mapService.isMapInitialized).toHaveBeenCalled();
  });

  it('should save current shape', () => {
    const mockShapes = [mockGeoJSON];
    mapService.getAllShapes.and.returnValue(mockShapes);
    spyOn(component, 'saveShapeToBackend');

    component.saveCurrentShape();

    expect(component.saveShapeToBackend).toHaveBeenCalledWith(mockGeoJSON, 'Region 1');
  });

  it('should not save current shape when no shapes exist', () => {
    mapService.getAllShapes.and.returnValue([]);
    spyOn(component, 'saveShapeToBackend');

    component.saveCurrentShape();

    expect(component.saveShapeToBackend).not.toHaveBeenCalled();
  });

  it('should edit regions (placeholder)', () => {
    expect(() => component.editRegions()).not.toThrow();
  });

  it('should export regions (placeholder)', () => {
    expect(() => component.exportRegions()).not.toThrow();
  });

  it('should destroy map on ngOnDestroy', () => {
    component.ngOnDestroy();

    expect(mapService.destroyMap).toHaveBeenCalled();
  });

  it('should initialize map correctly', () => {
    const mockMap = {} as any;
    mapService.initializeMap.and.returnValue(mockMap);

    component.initializeMap();

    expect(mapService.initializeMap).toHaveBeenCalledWith('map');
  });

  it('should handle map initialization error', () => {
    mapService.initializeMap.and.throwError('Map initialization failed');

    component.initializeMap();

    expect(component.errorMessage).toBe('Failed to initialize map');
  });

  it('should subscribe to map service events', () => {
    spyOn(mapService.onShapeCreated, 'subscribe');
    spyOn(mapService.onShapeDeleted, 'subscribe');
    spyOn(mapService.onMapInitialized, 'subscribe');
    spyOn(mapService.onRegionsLoaded, 'subscribe');

    component.subscribeToEvents();

    expect(mapService.onShapeCreated.subscribe).toHaveBeenCalled();
    expect(mapService.onShapeDeleted.subscribe).toHaveBeenCalled();
    expect(mapService.onMapInitialized.subscribe).toHaveBeenCalled();
    expect(mapService.onRegionsLoaded.subscribe).toHaveBeenCalled();
  });
});
