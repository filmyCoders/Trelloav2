import { Component } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthService, ILoginRequests } from '../../../../core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '../../../../shared/component/base/base.component';
import { UserService } from '../../../../core/services/api/user.service';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent extends BaseComponent  {
 public isLogin: boolean = false;
  userRole!:string
  socialUser!: SocialUser;

  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
    password: new FormControl('', [Validators.required,Validators.minLength(6),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/)]),
    rememberMe: new FormControl(false)
  });


  constructor( private _routing: Router, private _authservice:AuthService,private _userServices:UserService,    private socialAuthService: SocialAuthService

      
    
    ){
    super();

    debugger
  }
  protected override onInit(): void {
      // Listen to the sign-in status change
  

 // Check if there's saved login info in local storage
 const savedEmail = localStorage.getItem('email');
 if (savedEmail) {
   this.loginForm.patchValue({ email: savedEmail, rememberMe: true });
 } 


 this.socialAuthService.authState.subscribe((user) => {

  this.socialUser = user;


  console.log(this.socialUser);

});




}
  protected override onViewInit(): void {
  }
  protected override onDestroy(): void {

  }

  public checkLoginform(): void {
    debugger
    if (this.loginForm.valid) {
      const reqModel: ILoginRequests = {
        email: this.loginForm.controls['email'].value ?? '',
        password: this.loginForm.controls['password'].value ?? '',
        rememberMe: this.loginForm.controls['rememberMe'].value ?? false
      };

      // Save or remove email from local storage based on rememberMe checkbox
      if (reqModel.rememberMe) {
        
        localStorage.setItem('email', reqModel.email);
      } else {
        localStorage.removeItem('email');
      }

      this.loginApiCall(reqModel);
    } else {
    //  markFormGroupTouched(this.loginForm);
    }
  }
    private loginApiCall(reqModel: ILoginRequests): void {
      this._authservice.loginUser(reqModel)
      .pipe(
        finalize(() => {
          // Handle any cleanup logic, e.g., stopping the loader
        })
      )
      .subscribe({
        next: (response) => {
          if (response.flag) {
            console.log("Response", response);
            
             this.userRole = this._userServices.getUserRoles().toString();
            
            if (this.userRole != "User") {
              // Handle user-specific logic, e.g., remove token
              this._authservice.removeToken();
              // Optionally show error/toast message here if needed
               this.toaster.showErrorToast('Invalid credentials');
            } else  {
              // Navigate to the admin dashboard if admin is logged in
              this._routing.navigate(['../home']);
            }
          } else {
            // Handle the case where login fails (e.g., invalid credentials)
             this.toaster.showWarningToast(response.message || 'Login failed!');
          }
        },
        error: (error) => {
          // Handle the error case, such as server errors or network issues
           this.toaster.showErrorToast(error.error?.error || 'Login failed!');
        }
      });
}
loginWithGoogle(): void {

  this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);

}




}