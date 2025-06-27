import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth.routes';
import { LoginComponent } from '../../features/user/authentication/login/login.component';
import { RegisterComponent } from '../../features/user/authentication/register/register.component';
import { ForgetPasswordComponent } from '../../features/user/authentication/forget-password/forget-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from "../../shared/shared.module";
import { GoogleWithLoginComponent } from '../../features/user/authentication/google-with-login/google-with-login.component';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';


@NgModule({
  declarations: [LoginComponent,RegisterComponent,ForgetPasswordComponent,GoogleWithLoginComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    
]
})
export class AuthModule { }
