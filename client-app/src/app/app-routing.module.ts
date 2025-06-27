import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { requireAuthenticated } from './core/guards/auth.guard';
import { requireAnonymous } from './core/guards/login.guard';

const routes: Routes = [
  // Root User Routes
  {
    path: '',
    loadChildren: () => import('./modules/root/root.module').then(m => m.RootModule),
    canActivate: [requireAuthenticated()], // User must be authenticated
  },
  // Admin Routes
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin-modules/admin/admin.module').then(m => m.AdminModule),
    // Guard can be applied within admin module (role-based guarding)
  },
  // Auth Routes (for both admin and user login)
  {
    path: 'auth', 
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule), 
       canActivate: [requireAnonymous()], // User must be authenticated

  },
  // Catch-all route for undefined paths
  {
    path: '**',
    redirectTo: '', // Redirect to root (home or dashboard) if path not found
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
