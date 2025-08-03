import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appRole]'
})
export class RoleDirective implements OnInit, OnDestroy {
  @Input() appRole: string | string[] = '';
  @Input() appRoleOperator: 'AND' | 'OR' = 'OR';
  
  private currentUser: User | null = null;
  private subscription: Subscription = new Subscription();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.updateView();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateView(): void {
    const hasRole = this.checkRole();
    
    if (hasRole && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRole && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkRole(): boolean {
    if (!this.currentUser || !this.currentUser.role) {
      return false;
    }

    const requiredRoles = Array.isArray(this.appRole) ? this.appRole : [this.appRole];
    const userRole = this.currentUser.role.toUpperCase();

    if (this.appRoleOperator === 'AND') {
      return requiredRoles.every(role => userRole === role.toUpperCase());
    } else {
      return requiredRoles.some(role => userRole === role.toUpperCase());
    }
  }
} 