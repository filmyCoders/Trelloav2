import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingComponent } from '../../../features/admin/setting/setting.component';
import { ProfileDetailsComponent } from '../../../features/admin/profile-details/profile-details.component';
import { ChangePasswordComponent } from '../../../features/admin/change-password/change-password.component';
import { ResetPasswordComponent } from '../../../features/admin/reset-password/reset-password.component';

export const routes: Routes = [
  {
    path: '',
    component: SettingComponent,
    children: [
      { path: '', redirectTo: 'profile-details', pathMatch: 'full' }, // Redirect to profile-details by default
      { path: 'profile-details', component: ProfileDetailsComponent }, // Child route for profile details
      { path: 'change-password', component: ChangePasswordComponent }, // Child route for change password
      { path: 'reset-password', component: ResetPasswordComponent }, // Child route for change password

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
