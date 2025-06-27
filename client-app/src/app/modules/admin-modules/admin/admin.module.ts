import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule, routes } from './admin.routes';
import { AdminloginComponent } from '../../../features/admin/adminlogin/adminlogin.component';
import { UsersComponent } from '../../../features/admin/users/users.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { AdminRootModule } from '../admin-root/admin-root.module';
import { ForgetPasswordComponent } from '../../../features/admin/forget-password/forget-password.component';


@NgModule({
  declarations: [AdminloginComponent,ForgetPasswordComponent
    ],
  imports: [
    RouterModule.forChild(routes),   

    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    AdminRootModule
     

  ]
})
export class AdminModule { }
