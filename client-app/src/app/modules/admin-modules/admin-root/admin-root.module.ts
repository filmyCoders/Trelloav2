import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRootRoutingModule, routes } from './admin-root.routes';
import { UsersComponent } from '../../../features/admin/users/users.component';
import { RouterModule } from '@angular/router';
import { AdminLayoutComponent } from '../../../features/admin/admin-layout/admin-layout.component';
import { DashbordComponent } from '../../../features/admin/dashbord/dashbord.component';
import { RolesComponent } from '../../../features/admin/roles/roles.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SettingModule } from '../setting/setting.module';
import { SharedModule } from '../../../shared/shared.module';
import { EventTaskModule } from '../event-task/event-task.module';


@NgModule({
  declarations: [UsersComponent,RolesComponent,DashbordComponent,AdminLayoutComponent,
  ],
  imports: [
    RouterModule.forChild(routes),   
    CommonModule,
    AdminRootRoutingModule,
    ReactiveFormsModule,
    SharedModule,
  SettingModule,
  EventTaskModule
  ]
})
export class AdminRootModule { }
