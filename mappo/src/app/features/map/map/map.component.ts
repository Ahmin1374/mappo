import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MapService, GeoJSONFeature } from '../map.service';
import { RegionService, RegionDto } from '../../../services/region.service';
import { RoleService } from '../../../services/role.service';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  public regions: RegionDto[] = [];
  public loading = false;
  public errorMessage = '';

  constructor(
    private mapService: MapService, 
    private regionService: RegionService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    console.log('🔍 MapComponent ngOnInit called');
    console.log('🔍 MapContainer element:', this.mapContainer);
    console.log('🔍 MapContainer nativeElement:', this.mapContainer?.nativeElement);
    this.initializeMap();
    this.subscribeToEvents();
  }

  public initializeMap(): void {
    try {
      console.log('🔍 Initializing map...');
      console.log('🔍 Map container element:', this.mapContainer.nativeElement);
      console.log('🔍 Map container ID:', this.mapContainer.nativeElement.id);
      
      this.mapService.initializeMap(this.mapContainer.nativeElement.id);
      console.log('🔍 Map initialization completed');
    } catch (error) {
      console.error('🔍 Error initializing map:', error);
      this.errorMessage = 'Failed to initialize map';
    }
  }

  public subscribeToEvents(): void {
    this.mapService.onShapeCreated.subscribe((feature: GeoJSONFeature) => {
      console.log('🔍 Shape created:', feature);
    });

    this.mapService.onShapeDeleted.subscribe((shapeId: string) => {
      console.log('🔍 Shape deleted:', shapeId);
    });

    this.mapService.onMapInitialized.subscribe(() => {
      console.log('🔍 Map initialized event received');
    });

    this.mapService.onRegionsLoaded.subscribe((regions: RegionDto[]) => {
      this.handleRegionsLoaded(regions);
    });
  }

  public handleRegionsLoaded(regions: RegionDto[]): void {
    console.log('🔍 Regions loaded:', regions);
    this.regions = regions;
    this.errorMessage = '';
  }

  public saveShapeToBackend(feature: GeoJSONFeature, name: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.mapService.saveRegion(feature, name).subscribe({
      next: (region) => {
        console.log('🔍 Region saved:', region);
        this.regions.push(region);
        this.loading = false;
      },
      error: (error) => {
        console.error('🔍 Error saving region:', error);
        this.errorMessage = 'Failed to save region';
        this.loading = false;
      }
    });
  }

  public loadRegionsInBounds(): void {
    this.mapService.loadRegionsInBounds();
  }

  public clearAllShapes(): void {
    this.mapService.clearAllShapes();
  }

  public getShapeCount(): number {
    return this.mapService.getAllShapes().length;
  }

  public getRegionCount(): number {
    return this.regions.length;
  }

  public isMapInitialized(): boolean {
    return this.mapService.isMapInitialized();
  }

  // Role-based methods
  public saveCurrentShape(): void {
    const shapes = this.mapService.getAllShapes();
    if (shapes.length > 0) {
      const lastShape = shapes[shapes.length - 1];
      const name = `Region ${this.regions.length + 1}`;
      this.saveShapeToBackend(lastShape, name);
    }
  }

  public editRegions(): void {
    // TODO: Implement region editing functionality
    console.log('🔍 Edit regions functionality to be implemented');
  }

  public exportRegions(): void {
    // TODO: Implement region export functionality
    console.log('🔍 Export regions functionality to be implemented');
  }

  ngOnDestroy(): void {
    this.mapService.destroyMap();
  }
}
