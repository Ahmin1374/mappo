import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { RoleDirective } from './role.directive';
import { AuthService, User } from '../../services/auth.service';

@Component({
  template: `
    <div *appRole="'ADMIN'">Admin Content</div>
    <div *appRole="['ADMIN', 'BROKER']">Admin or Broker Content</div>
    <div *appRole="['ADMIN', 'BROKER']; operator: 'AND'">Admin and Broker Content</div>
    <div *appRole="'VIEWER'">Viewer Content</div>
  `
})
class TestComponent {}

describe('RoleDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let currentUserSubject: BehaviorSubject<User | null>;

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<User | null>(null);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser$: currentUserSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      declarations: [TestComponent, RoleDirective],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show admin content when user has ADMIN role', () => {
    currentUserSubject.next({ username: 'admin', role: 'ADMIN' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Admin Content');
    expect(compiled.textContent).toContain('Admin or Broker Content');
    expect(compiled.textContent).not.toContain('Viewer Content');
  });

  it('should show broker content when user has BROKER role', () => {
    currentUserSubject.next({ username: 'broker', role: 'BROKER' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).not.toContain('Admin Content');
    expect(compiled.textContent).toContain('Admin or Broker Content');
    expect(compiled.textContent).not.toContain('Viewer Content');
  });

  it('should show viewer content when user has VIEWER role', () => {
    currentUserSubject.next({ username: 'viewer', role: 'VIEWER' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).not.toContain('Admin Content');
    expect(compiled.textContent).not.toContain('Admin or Broker Content');
    expect(compiled.textContent).toContain('Viewer Content');
  });

  it('should hide all content when user is not authenticated', () => {
    currentUserSubject.next(null);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).not.toContain('Admin Content');
    expect(compiled.textContent).not.toContain('Admin or Broker Content');
    expect(compiled.textContent).not.toContain('Viewer Content');
  });

  it('should hide content when user has no role', () => {
    currentUserSubject.next({ username: 'user', role: '' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).not.toContain('Admin Content');
    expect(compiled.textContent).not.toContain('Admin or Broker Content');
    expect(compiled.textContent).not.toContain('Viewer Content');
  });

  it('should handle case-insensitive role comparison', () => {
    currentUserSubject.next({ username: 'admin', role: 'admin' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Admin Content');
  });
}); 