import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RegionService, RegionDto } from './region.service';
import { environment } from '../../environments/environment';

describe('RegionService', () => {
  let service: RegionService;
  let httpMock: HttpTestingController;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegionService]
    });
    service = TestBed.inject(RegionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createRegion', () => {
    it('should create a new region', () => {
      const newRegion: RegionDto = {
        name: 'New Region',
        geoJson: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        }
      };

      service.createRegion(newRegion).subscribe(region => {
        expect(region).toEqual(mockRegion);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newRegion);
      req.flush(mockRegion);
    });
  });

  describe('getRegions', () => {
    it('should get regions with pagination', () => {
      const mockResponse = {
        content: [mockRegion],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0
      };

      service.getRegions(0, 10).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should use default pagination when no parameters provided', () => {
      const mockResponse = {
        content: [mockRegion],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0
      };

      service.getRegions().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getRegion', () => {
    it('should get a specific region by ID', () => {
      service.getRegion('123').subscribe(region => {
        expect(region).toEqual(mockRegion);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions/123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRegion);
    });
  });

  describe('updateRegion', () => {
    it('should update a region', () => {
      const updatedRegion: RegionDto = {
        ...mockRegion,
        name: 'Updated Region'
      };

      service.updateRegion('123', updatedRegion).subscribe(region => {
        expect(region).toEqual(updatedRegion);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions/123`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedRegion);
      req.flush(updatedRegion);
    });
  });

  describe('deleteRegion', () => {
    it('should delete a region', () => {
      service.deleteRegion('123').subscribe(() => {
        // Should complete without error
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions/123`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('searchRegions', () => {
    it('should search regions by name', () => {
      service.searchRegions('test').subscribe(regions => {
        expect(regions).toEqual([mockRegion]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions/search?name=test`);
      expect(req.request.method).toBe('GET');
      req.flush([mockRegion]);
    });
  });

  describe('getRegionsInBounds', () => {
    it('should get regions within bounds', () => {
      service.getRegionsInBounds(0, 0, 1, 1).subscribe(regions => {
        expect(regions).toEqual([mockRegion]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions/bounds?minX=0&minY=0&maxX=1&maxY=1`);
      expect(req.request.method).toBe('GET');
      req.flush([mockRegion]);
    });
  });

  describe('getRegionCount', () => {
    it('should get region count', () => {
      service.getRegionCount().subscribe(count => {
        expect(count).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions/count`);
      expect(req.request.method).toBe('GET');
      req.flush(1);
    });
  });
}); 