import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingRoutingModule, routes } from './setting.routes';
import { SettingComponent } from '../../../features/admin/setting/setting.component';
import { ProfileDetailsComponent } from '../../../features/admin/profile-details/profile-details.component';
import { ChangePasswordComponent } from '../../../features/admin/change-password/change-password.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { ResetPasswordComponent } from '../../../features/admin/reset-password/reset-password.component';

@NgModule({
  declarations: [
    SettingComponent,
    ProfileDetailsComponent,ChangePasswordComponent,ResetPasswordComponent
  ],
  imports: [
    RouterModule.forChild(routes),   
  ReactiveFormsModule,
    CommonModule,
    SettingRoutingModule, 
    RouterModule ,// Correctly imports routing module
    SharedModule,
    
  ]
})
export class SettingModule {
  constructor() {
    console.log("Setting module loaded");
  }
}
