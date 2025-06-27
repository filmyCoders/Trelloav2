import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../../features/user/authentication/login/login.component';
import { RegisterComponent } from '../../features/user/authentication/register/register.component';
import { ForgetPasswordComponent } from '../../features/user/authentication/forget-password/forget-password.component';
import { GoogleWithLoginComponent } from '../../features/user/authentication/google-with-login/google-with-login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgetPasswordComponent },
  { path: 'google-login', component: GoogleWithLoginComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
