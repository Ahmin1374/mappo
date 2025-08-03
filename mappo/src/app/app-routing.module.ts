import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/map', pathMatch: 'full' }, // Temporarily redirect to map
  { path: 'login', component: LoginComponent },
  { 
    path: 'map', 
    loadChildren: () => import('./features/map/map.module').then(m => m.MapModule),
    //canActivate: [AuthGuard] // Temporarily disabled for testing
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
