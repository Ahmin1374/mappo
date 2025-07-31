import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegionDto {
  id?: string;
  name: string;
  geoJson: any;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegionResponse {
  content: RegionDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegionService {

  constructor(private http: HttpClient) { }

  // Create a new region
  createRegion(region: RegionDto): Observable<RegionDto> {
    return this.http.post<RegionDto>(`${environment.apiUrl}/regions`, region);
  }

  // Get all regions for the current user (paginated)
  getRegions(page: number = 0, size: number = 10): Observable<RegionResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<RegionResponse>(`${environment.apiUrl}/regions`, { params });
  }

  // Get a specific region by ID
  getRegion(id: string): Observable<RegionDto> {
    return this.http.get<RegionDto>(`${environment.apiUrl}/regions/${id}`);
  }

  // Update a region
  updateRegion(id: string, region: RegionDto): Observable<RegionDto> {
    return this.http.put<RegionDto>(`${environment.apiUrl}/regions/${id}`, region);
  }

  // Delete a region
  deleteRegion(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/regions/${id}`);
  }

  // Search regions by name
  searchRegions(name: string): Observable<RegionDto[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<RegionDto[]>(`${environment.apiUrl}/regions/search`, { params });
  }

  // Get regions within map bounds
  getRegionsInBounds(minX: number, minY: number, maxX: number, maxY: number): Observable<RegionDto[]> {
    const params = new HttpParams()
      .set('minX', minX.toString())
      .set('minY', minY.toString())
      .set('maxX', maxX.toString())
      .set('maxY', maxY.toString());
    
    return this.http.get<RegionDto[]>(`${environment.apiUrl}/regions/bounds`, { params });
  }

  // Get region count for the current user
  getRegionCount(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/regions/count`);
  }
} 