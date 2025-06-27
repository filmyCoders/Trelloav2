import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminloginComponent } from '../../../features/admin/adminlogin/adminlogin.component';
import { requireAuthenticatedAdmin } from '../../../core/guards/admin.guard';
import { requireAnonymousAdmin } from '../../../core/guards/login.guard';
import { ForgetPasswordComponent } from '../../../features/admin/forget-password/forget-password.component';

export const routes: Routes = [
  {
    path: 'login',
    component: AdminloginComponent, 
    canActivate: [requireAnonymousAdmin()] // Ensure the guard is used without parentheses
  },
  {
    path: 'forgot-password-admin',
    component: ForgetPasswordComponent, 
    canActivate: [requireAnonymousAdmin()] // Ensure the guard is used without parentheses
  },
 
  {
    path: '',
    loadChildren: () => import('../admin-root/admin-root.module').then(m => m.AdminRootModule),    
    canActivate: [requireAuthenticatedAdmin], // Ensure proper guard reference
  },
  {
    path: '**',
    redirectTo: '', // Redirect to dashboard or home if the route is not found
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
