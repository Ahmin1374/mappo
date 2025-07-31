import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { MapService, GeoJSONFeature } from '../map.service';
import { RegionService, RegionDto } from '../../../services/region.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @Output() shapeCreated = new EventEmitter<GeoJSONFeature>();
  @Output() shapeDeleted = new EventEmitter<string>();
  @Output() mapInitialized = new EventEmitter<void>();

  private mapInitializedFlag = false;
  public drawnShapes: GeoJSONFeature[] = [];
  public regions: RegionDto[] = [];
  public loading = false;
  public errorMessage = '';

  constructor(
    private mapService: MapService,
    private regionService: RegionService
  ) {}

  ngOnInit(): void {
    console.log('🔍 MapComponent ngOnInit called');
    console.log('🔍 MapContainer element:', this.mapContainer);
    console.log('🔍 MapContainer nativeElement:', this.mapContainer?.nativeElement);
    
    this.initializeMap();
    this.subscribeToEvents();
  }

  ngOnDestroy(): void {
    this.mapService.destroyMap();
  }

  /**
   * Initialize the map in the container
   */
  public initializeMap(): void {
    try {
      console.log('🔍 Initializing map...');
      console.log('🔍 Map container element:', this.mapContainer.nativeElement);
      console.log('🔍 Map container ID:', this.mapContainer.nativeElement.id);
      
      const containerId = this.mapContainer.nativeElement.id;
      const map = this.mapService.initializeMap(containerId);
      
      console.log('🔍 Map service returned:', map);
      this.mapInitializedFlag = true;
      console.log('✅ Map initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize map:', error);
    }
  }

  /**
   * Subscribe to map service events
   */
  public subscribeToEvents(): void {
    // Subscribe to shape creation events
    this.mapService.onShapeCreated.subscribe((geoJSON: GeoJSONFeature) => {
      this.handleShapeCreated(geoJSON);
    });

    // Subscribe to shape deletion events
    this.mapService.onShapeDeleted.subscribe((shapeId: string) => {
      this.handleShapeDeleted(shapeId);
    });

    // Subscribe to map initialization events
    this.mapService.onMapInitialized.subscribe(() => {
      this.handleMapInitialized();
    });

    // Subscribe to regions loaded events
    this.mapService.onRegionsLoaded.subscribe((regions: RegionDto[]) => {
      this.handleRegionsLoaded(regions);
    });
  }

  /**
   * Handle shape creation
   */
  public handleShapeCreated(geoJSON: GeoJSONFeature): void {
    this.drawnShapes.push(geoJSON);
    
    // Log GeoJSON to console as specified in requirements
    console.log('New shape created:', geoJSON);
    
    // Emit event to parent component
    this.shapeCreated.emit(geoJSON);
  }

  /**
   * Handle shape deletion
   */
  public handleShapeDeleted(shapeId: string): void {
    this.drawnShapes = this.drawnShapes.filter(shape => shape.properties.id !== shapeId);
    
    console.log('Shape deleted:', shapeId);
    
    // Emit event to parent component
    this.shapeDeleted.emit(shapeId);
  }

  /**
   * Handle map initialization
   */
  public handleMapInitialized(): void {
    console.log('Map initialized successfully');
    this.mapInitialized.emit();
  }

  /**
   * Handle regions loaded from backend
   */
  public handleRegionsLoaded(regions: RegionDto[]): void {
    this.regions = regions;
    console.log('Regions loaded from backend:', regions);
  }

  /**
   * Save a drawn shape to the backend
   */
  public saveShapeToBackend(feature: GeoJSONFeature, name: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.mapService.saveRegion(feature, name).subscribe({
      next: (savedRegion) => {
        console.log('Region saved successfully:', savedRegion);
        this.loading = false;
        // Refresh the regions list
        this.mapService.loadRegions();
      },
      error: (error) => {
        console.error('Error saving region:', error);
        this.errorMessage = 'Failed to save region. Please try again.';
        this.loading = false;
      }
    });
  }

  /**
   * Load regions within current map bounds
   */
  public loadRegionsInBounds(): void {
    this.mapService.loadRegionsInBounds();
  }

  /**
   * Clear all drawn shapes
   */
  public clearAllShapes(): void {
    this.mapService.clearAllShapes();
    this.drawnShapes = [];
  }

  /**
   * Get all shapes from the map
   */
  public getAllShapes(): GeoJSONFeature[] {
    return this.mapService.getAllShapes();
  }

  /**
   * Check if map is initialized
   */
  public isMapInitialized(): boolean {
    return this.mapInitializedFlag;
  }

  /**
   * Get the count of drawn shapes
   */
  public getShapeCount(): number {
    return this.drawnShapes.length;
  }

  /**
   * Get the count of regions from backend
   */
  public getRegionCount(): number {
    return this.regions.length;
  }
}
