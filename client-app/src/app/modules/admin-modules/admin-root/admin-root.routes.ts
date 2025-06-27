import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../../features/admin/admin-layout/admin-layout.component';
import { UsersComponent } from '../../../features/admin/users/users.component';
import { DashbordComponent } from '../../../features/admin/dashbord/dashbord.component';
import { RolesComponent } from '../../../features/admin/roles/roles.component';
import { requireAuthenticatedAdmin } from '../../../core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [requireAuthenticatedAdmin()],
    children: [
      { path: 'dashboard', component: DashbordComponent },
      { path: 'users', component: UsersComponent },
      { path: 'roles', component: RolesComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      { path: 'setting', loadChildren: () => import('../setting/setting.module').then(m => m.SettingModule), canActivate: [requireAuthenticatedAdmin()] },
      { path: 'event-task', loadChildren: () => import('../event-task/event-task.module').then(m => m.EventTaskModule), canActivate: [requireAuthenticatedAdmin()] },

    ],
  },
  { path: '**', redirectTo: 'dashboard' } // Wildcard route for unknown paths
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRootRoutingModule {constructor(){
  
}}
