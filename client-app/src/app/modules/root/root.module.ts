import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RootRoutingModule } from './root.routes';
import { RootLayoutComponent } from '../../features/user/user-details/root-layout/root-layout.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [RootLayoutComponent 

  ],
  imports: [
    CommonModule,
    RootRoutingModule,
    ReactiveFormsModule

  ]
})
export class RootModule { }
