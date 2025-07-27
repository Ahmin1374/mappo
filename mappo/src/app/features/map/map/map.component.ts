import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { MapService, GeoJSONFeature } from '../map.service';

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

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
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
      const containerId = this.mapContainer.nativeElement.id;
      this.mapService.initializeMap(containerId);
      this.mapInitializedFlag = true;
    } catch (error) {
      console.error('Failed to initialize map:', error);
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
   * Clear all drawn shapes
   */
  public clearAllShapes(): void {
    this.mapService.clearAllShapes();
    this.drawnShapes = [];
    console.log('All shapes cleared');
  }

  /**
   * Get all drawn shapes as GeoJSON
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
   * Get current shape count
   */
  public getShapeCount(): number {
    return this.drawnShapes.length;
  }
}
