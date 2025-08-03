import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { RoleService } from './role.service';
import { AuthService, User } from './auth.service';

describe('RoleService', () => {
  let service: RoleService;
  let authService: jasmine.SpyObj<AuthService>;
  let currentUserSubject: BehaviorSubject<User | null>;

  beforeEach(() => {
    currentUserSubject = new BehaviorSubject<User | null>(null);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser$: currentUserSubject.asObservable()
    });

    TestBed.configureTestingModule({
      providers: [
        RoleService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(RoleService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('hasRole', () => {
    it('should return true for admin user with ADMIN role', (done) => {
      currentUserSubject.next({ username: 'admin', role: 'ADMIN' });
      
      service.hasRole('ADMIN').subscribe(result => {
        expect(result).toBe(true);
        done();
      });
    });

    it('should return false for admin user with different role', (done) => {
      currentUserSubject.next({ username: 'admin', role: 'ADMIN' });
      
      service.hasRole('VIEWER').subscribe(result => {
        expect(result).toBe(false);
        done();
      });
    });

    it('should return true for user with any of multiple roles', (done) => {
      currentUserSubject.next({ username: 'broker', role: 'BROKER' });
      
      service.hasRole(['ADMIN', 'BROKER']).subscribe(result => {
        expect(result).toBe(true);
        done();
      });
    });

    it('should return false for unauthenticated user', (done) => {
      currentUserSubject.next(null);
      
      service.hasRole('ADMIN').subscribe(result => {
        expect(result).toBe(false);
        done();
      });
    });

    it('should handle case-insensitive role comparison', (done) => {
      currentUserSubject.next({ username: 'admin', role: 'admin' });
      
      service.hasRole('ADMIN').subscribe(result => {
        expect(result).toBe(true);
        done();
      });
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin creating region', (done) => {
      currentUserSubject.next({ username: 'admin', role: 'ADMIN' });
      
      service.hasPermission('create', 'region').subscribe(result => {
        expect(result).toBe(true);
        done();
      });
    });

    it('should return true for broker creating region', (done) => {
      currentUserSubject.next({ username: 'broker', role: 'BROKER' });
      
      service.hasPermission('create', 'region').subscribe(result => {
        expect(result).toBe(true);
        done();
      });
    });

    it('should return false for viewer creating region', (done) => {
      currentUserSubject.next({ username: 'viewer', role: 'VIEWER' });
      
      service.hasPermission('create', 'region').subscribe(result => {
        expect(result).toBe(false);
        done();
      });
    });

    it('should return true for viewer reading region', (done) => {
      currentUserSubject.next({ username: 'viewer', role: 'VIEWER' });
      
      service.hasPermission('read', 'region').subscribe(result => {
        expect(result).toBe(true);
        done();
      });
    });

    it('should return false for non-existent permission', (done) => {
      currentUserSubject.next({ username: 'admin', role: 'ADMIN' });
      
      service.hasPermission('invalid', 'region').subscribe(result => {
        expect(result).toBe(false);
        done();
      });
    });
  });

  describe('convenience methods', () => {
    it('should return correct values for canCreateRegion', (done) => {
      currentUserSubject.next({ username: 'admin', role: 'ADMIN' });
      
      service.canCreateRegion().subscribe(result => {
        expect(result).toBe(true);
        done();
      });
    });

    it('should return correct values for isAdmin', (done) => {
      currentUserSubject.next({ username: 'admin', role: 'ADMIN' });
      
      service.isAdmin().subscribe(result => {
        expect(result).toBe(true);
        done();
      });
    });

    it('should return correct values for isAdminOrBroker', (done) => {
      currentUserSubject.next({ username: 'broker', role: 'BROKER' });
      
      service.isAdminOrBroker().subscribe(result => {
        expect(result).toBe(true);
        done();
      });
    });
  });

  describe('getCurrentUserRole', () => {
    it('should return user role', (done) => {
      currentUserSubject.next({ username: 'admin', role: 'ADMIN' });
      
      service.getCurrentUserRole().subscribe(result => {
        expect(result).toBe('ADMIN');
        done();
      });
    });

    it('should return null for unauthenticated user', (done) => {
      currentUserSubject.next(null);
      
      service.getCurrentUserRole().subscribe(result => {
        expect(result).toBe(null);
        done();
      });
    });
  });

  describe('getRoleDisplayName', () => {
    it('should return display name for ADMIN', () => {
      expect(service.getRoleDisplayName('ADMIN')).toBe('Administrator');
    });

    it('should return display name for BROKER', () => {
      expect(service.getRoleDisplayName('BROKER')).toBe('Broker');
    });

    it('should return display name for VIEWER', () => {
      expect(service.getRoleDisplayName('VIEWER')).toBe('Viewer');
    });

    it('should return original role for unknown role', () => {
      expect(service.getRoleDisplayName('UNKNOWN')).toBe('UNKNOWN');
    });

    it('should handle case-insensitive input', () => {
      expect(service.getRoleDisplayName('admin')).toBe('Administrator');
    });
  });
}); 