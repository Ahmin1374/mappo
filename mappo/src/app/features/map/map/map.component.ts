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
    this.initializeMap();
    this.subscribeToEvents();
  }

  public initializeMap(): void {
    try {
      this.mapService.initializeMap(this.mapContainer.nativeElement.id);
    } catch (error) {
      console.error('Error initializing map:', error);
      this.errorMessage = 'Failed to initialize map';
    }
  }

  public subscribeToEvents(): void {
    this.mapService.onShapeCreated.subscribe((feature: GeoJSONFeature) => {
    });

    this.mapService.onShapeDeleted.subscribe((shapeId: string) => {
    });

    this.mapService.onMapInitialized.subscribe(() => {
    });

    this.mapService.onRegionsLoaded.subscribe((regions: RegionDto[]) => {
      this.handleRegionsLoaded(regions);
    });
  }

  public handleRegionsLoaded(regions: RegionDto[]): void {
    this.regions = regions;
    this.errorMessage = '';
  }

  public saveShapeToBackend(feature: GeoJSONFeature, name: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.mapService.saveRegion(feature, name).subscribe({
      next: (region) => {
        this.regions.push(region);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error saving region:', error);
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
  }

  public exportRegions(): void {
    // TODO: Implement region export functionality
  }

  ngOnDestroy(): void {
    this.mapService.destroyMap();
  }
}
