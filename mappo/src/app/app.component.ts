import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from './services/auth.service';
import { RoleService } from './services/role.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'mappo';
  currentUser$ = this.authService.currentUser$;

  constructor(
    private authService: AuthService,
    private router: Router,
    private roleService: RoleService
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRoleDisplayName(role: string): string {
    return this.roleService.getRoleDisplayName(role);
  }
}
