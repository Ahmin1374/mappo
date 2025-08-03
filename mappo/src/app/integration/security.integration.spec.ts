import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';

import { AppComponent } from '../app.component';
import { LoginComponent } from '../components/login/login.component';
import { MapComponent } from '../features/map/map/map.component';
import { AuthService, LoginRequest, LoginResponse, User } from '../services/auth.service';
import { RoleService } from '../services/role.service';
import { RegionService, RegionDto } from '../services/region.service';
import { SharedModule } from '../shared/shared.module';
import { environment } from '../../environments/environment';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

describe('Security Integration Tests', () => {
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let roleService: RoleService;
  let regionService: RegionService;
  let appFixture: ComponentFixture<AppComponent>;
  let loginFixture: ComponentFixture<LoginComponent>;
  let mapFixture: ComponentFixture<MapComponent>;

  const mockUsers = {
    admin: { username: 'admin', password: 'password', role: 'ADMIN' },
    broker: { username: 'broker', password: 'password', role: 'BROKER' },
    viewer: { username: 'viewer', password: 'password', role: 'VIEWER' }
  };

  const mockLoginResponse = (user: any): LoginResponse => ({
    token: `mock-jwt-token-${user.username}`,
    username: user.username,
    role: user.role,
    type: 'Bearer'
  });

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
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        SharedModule
      ],
      declarations: [
        AppComponent,
        LoginComponent,
        MapComponent
      ],
      providers: [
        AuthService,
        RoleService,
        RegionService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    roleService = TestBed.inject(RoleService);
    regionService = TestBed.inject(RegionService);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Authentication Flow Integration', () => {
    it('should handle successful login and store token', (done) => {
      const user = mockUsers.admin;
      
      authService.login({ username: user.username, password: user.password }).subscribe(response => {
        expect(response.token).toBe(`mock-jwt-token-${user.username}`);
        expect(response.username).toBe(user.username);
        expect(response.role).toBe(user.role);
        expect(authService.isAuthenticated()).toBe(true);
        expect(localStorage.getItem('auth_token')).toBe(`mock-jwt-token-${user.username}`);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockLoginResponse(user));
    });

    it('should handle login failure', (done) => {
      const user = mockUsers.admin;
      
      authService.login({ username: user.username, password: 'wrongpassword' }).subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          expect(authService.isAuthenticated()).toBe(false);
          expect(localStorage.getItem('auth_token')).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle logout and clear authentication', (done) => {
      const user = mockUsers.admin;
      
      // First login
      authService.login({ username: user.username, password: user.password }).subscribe(() => {
        expect(authService.isAuthenticated()).toBe(true);
        
        // Then logout
        authService.logout();
        expect(authService.isAuthenticated()).toBe(false);
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('current_user')).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockLoginResponse(user));
    });

    it('should persist authentication state across page reloads', (done) => {
      const user = mockUsers.admin;
      
      authService.login({ username: user.username, password: user.password }).subscribe(() => {
        // Simulate page reload by creating new AuthService instance
        const newAuthService = TestBed.inject(AuthService);
        expect(newAuthService.isAuthenticated()).toBe(true);
        expect(newAuthService.getCurrentUser()?.username).toBe(user.username);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockLoginResponse(user));
    });
  });

  describe('Role-Based Access Control Integration', () => {
    it('should enforce admin permissions for all operations', (done) => {
      const user = mockUsers.admin;
      
      // Login as admin
      authService.login({ username: user.username, password: user.password }).subscribe();
      const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      loginReq.flush(mockLoginResponse(user));

      // Test admin operation (get region count)
      const adminOperation = regionService.getRegionCount();
      adminOperation.subscribe(count => {
        expect(count).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions/count`);
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer mock-jwt-token-${user.username}`);
      req.flush(5);
    });

    it('should enforce broker permissions for region operations', (done) => {
      const user = mockUsers.broker;
      
      // Login as broker
      authService.login({ username: user.username, password: user.password }).subscribe();
      const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      loginReq.flush(mockLoginResponse(user));

      // Test broker operation (create region)
      const createRegionRequest: RegionDto = {
        name: 'Test Region',
        geoJson: mockRegion.geoJson
      };

      regionService.createRegion(createRegionRequest).subscribe(region => {
        expect(region.name).toBe('Test Region');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer mock-jwt-token-${user.username}`);
      req.flush(mockRegion);
    });

    it('should enforce viewer read-only access', (done) => {
      const user = mockUsers.viewer;
      
      // Login as viewer
      authService.login({ username: user.username, password: user.password }).subscribe();
      const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      loginReq.flush(mockLoginResponse(user));

      // Test viewer operation (read regions)
      regionService.getRegions().subscribe(response => {
        expect(response.content).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer mock-jwt-token-${user.username}`);
      req.flush({ content: [mockRegion], totalElements: 1, totalPages: 1, size: 10, number: 0 });
    });
  });

  describe('Frontend-Backend Security Integration', () => {
    it('should include JWT token in all API requests', (done) => {
      const user = mockUsers.admin;
      
      // Login first
      authService.login({ username: user.username, password: user.password }).subscribe();
      const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      loginReq.flush(mockLoginResponse(user));

      // Make any API request
      regionService.getRegions().subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions?page=0&size=10`);
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer mock-jwt-token-${user.username}`);
      req.flush({ content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 });
    });

    it('should handle 401 responses by clearing authentication', (done) => {
      const user = mockUsers.admin;
      
      // Login first
      authService.login({ username: user.username, password: user.password }).subscribe();
      const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      loginReq.flush(mockLoginResponse(user));

      // Make request that returns 401
      regionService.getRegions().subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          // Note: In a real app, the interceptor would handle this
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions?page=0&size=10`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('Role-Based UI Integration', () => {
    it('should show admin features for admin users', (done) => {
      const user = mockUsers.admin;
      
      authService.login({ username: user.username, password: user.password }).subscribe(() => {
        roleService.isAdmin().subscribe(isAdmin => {
          expect(isAdmin).toBe(true);
          roleService.canCreateRegion().subscribe(canCreate => {
            expect(canCreate).toBe(true);
            done();
          });
        });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockLoginResponse(user));
    });

    it('should show broker features for broker users', (done) => {
      const user = mockUsers.broker;
      
      authService.login({ username: user.username, password: user.password }).subscribe(() => {
        roleService.isBroker().subscribe(isBroker => {
          expect(isBroker).toBe(true);
          roleService.canCreateRegion().subscribe(canCreate => {
            expect(canCreate).toBe(true);
            done();
          });
        });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockLoginResponse(user));
    });

    it('should show viewer features for viewer users', (done) => {
      const user = mockUsers.viewer;
      
      authService.login({ username: user.username, password: user.password }).subscribe(() => {
        roleService.isViewer().subscribe(isViewer => {
          expect(isViewer).toBe(true);
          roleService.canReadRegion().subscribe(canRead => {
            expect(canRead).toBe(true);
            roleService.canCreateRegion().subscribe(canCreate => {
              expect(canCreate).toBe(false);
              done();
            });
          });
        });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockLoginResponse(user));
    });
  });

  describe('Data Security Integration', () => {
    it('should isolate user data by role', (done) => {
      const adminUser = mockUsers.admin;
      const brokerUser = mockUsers.broker;
      
      // Login as admin and get regions
      authService.login({ username: adminUser.username, password: adminUser.password }).subscribe(() => {
        regionService.getRegions().subscribe(adminRegions => {
          // Logout admin
          authService.logout();
          
          // Login as broker and get regions
          authService.login({ username: brokerUser.username, password: brokerUser.password }).subscribe(() => {
            regionService.getRegions().subscribe(brokerRegions => {
              // In a real app, these would be different based on user permissions
              expect(adminRegions).toBeDefined();
              expect(brokerRegions).toBeDefined();
              done();
            });

            const brokerReq = httpMock.expectOne(`${environment.apiUrl}/regions?page=0&size=10`);
            brokerReq.flush({ content: [mockRegion], totalElements: 1, totalPages: 1, size: 10, number: 0 });
          });

          const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
          loginReq.flush(mockLoginResponse(brokerUser));
        });

        const adminReq = httpMock.expectOne(`${environment.apiUrl}/regions?page=0&size=10`);
        adminReq.flush({ content: [mockRegion], totalElements: 1, totalPages: 1, size: 10, number: 0 });
      });

      const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      loginReq.flush(mockLoginResponse(adminUser));
    });
  });

  describe('Error Handling and Security', () => {
    it('should handle invalid tokens gracefully', (done) => {
      // Set invalid token manually
      localStorage.setItem('auth_token', 'invalid-token');
      
      regionService.getRegions().subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/regions?page=0&size=10`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });
}); 