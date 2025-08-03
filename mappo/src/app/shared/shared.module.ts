import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './components/loading/loading.component';
import { RoleDirective } from './directives/role.directive';

@NgModule({
  declarations: [ 
    LoadingComponent,
    RoleDirective
  ],
  imports: [ CommonModule ],
  exports: [ 
    LoadingComponent,
    RoleDirective
  ]
})
export class SharedModule { } 