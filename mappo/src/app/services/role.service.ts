import { Injectable } from '@angular/core';
import { AuthService, User } from './auth.service';
import { Observable, map } from 'rxjs';

export interface Permission {
  action: string;
  resource: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly permissions: Permission[] = [
    // Region permissions
    { action: 'create', resource: 'region', roles: ['ADMIN', 'BROKER'] },
    { action: 'update', resource: 'region', roles: ['ADMIN', 'BROKER'] },
    { action: 'delete', resource: 'region', roles: ['ADMIN', 'BROKER'] },
    { action: 'read', resource: 'region', roles: ['ADMIN', 'BROKER', 'VIEWER'] },
    
    // User management permissions
    { action: 'create', resource: 'user', roles: ['ADMIN'] },
    { action: 'update', resource: 'user', roles: ['ADMIN'] },
    { action: 'delete', resource: 'user', roles: ['ADMIN'] },
    { action: 'read', resource: 'user', roles: ['ADMIN'] },
    
    // System permissions
    { action: 'admin', resource: 'system', roles: ['ADMIN'] },
    { action: 'analytics', resource: 'system', roles: ['ADMIN', 'BROKER'] }
  ];

  constructor(private authService: AuthService) {}

  hasRole(role: string | string[]): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user || !user.role) return false;
        
        const requiredRoles = Array.isArray(role) ? role : [role];
        const userRole = user.role.toUpperCase();
        
        return requiredRoles.some(r => r.toUpperCase() === userRole);
      })
    );
  }

  hasPermission(action: string, resource: string): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user || !user.role) return false;
        
        const permission = this.permissions.find(p => 
          p.action === action && p.resource === resource
        );
        
        if (!permission) return false;
        
        return permission.roles.some(role => 
          role.toUpperCase() === user.role.toUpperCase()
        );
      })
    );
  }

  canCreateRegion(): Observable<boolean> {
    return this.hasPermission('create', 'region');
  }

  canUpdateRegion(): Observable<boolean> {
    return this.hasPermission('update', 'region');
  }

  canDeleteRegion(): Observable<boolean> {
    return this.hasPermission('delete', 'region');
  }

  canReadRegion(): Observable<boolean> {
    return this.hasPermission('read', 'region');
  }

  isAdmin(): Observable<boolean> {
    return this.hasRole('ADMIN');
  }

  isBroker(): Observable<boolean> {
    return this.hasRole('BROKER');
  }

  isViewer(): Observable<boolean> {
    return this.hasRole('VIEWER');
  }

  isAdminOrBroker(): Observable<boolean> {
    return this.hasRole(['ADMIN', 'BROKER']);
  }

  getCurrentUserRole(): Observable<string | null> {
    return this.authService.currentUser$.pipe(
      map(user => user?.role || null)
    );
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'ADMIN': 'Administrator',
      'BROKER': 'Broker',
      'VIEWER': 'Viewer'
    };
    return roleNames[role.toUpperCase()] || role;
  }
} 