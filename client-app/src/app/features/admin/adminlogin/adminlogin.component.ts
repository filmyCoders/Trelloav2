import { Component } from '@angular/core';
import { BaseComponent } from '../../../shared/component/base/base.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, ILoginRequests, IUser } from '../../../core';
import { finalize, switchMap, takeUntil } from 'rxjs';
import { UserService } from '../../../core/services/api/user.service';
import { markFormGroupTouched } from '../../../shared/validators/validators';

@Component({
  selector: 'app-adminlogin',
  templateUrl: './adminlogin.component.html',
  styleUrl: './adminlogin.component.css'
})
export class AdminloginComponent extends BaseComponent {
  public isLoading = false;
  userRole!: string
  user!: IUser
  public loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]), password: new FormControl('', [Validators.required, Validators.minLength(6),
    Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/)
    ]),

    rememberMe: new FormControl(false)
  });


  constructor(private _routing: Router, private _authservice: AuthService, private _userServices: UserService
  ) {
    super();
  }
  protected override onInit(): void {
    // Check if there's saved login info in local storage

    const savedEmail = localStorage.getItem('email');
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail, rememberMe: true });
    }
  }
  protected override onViewInit(): void {
  }
  protected override onDestroy(): void {
  }

  public checkLoginform(): void {
    // this.toaster.showSuccessToast("response.message");

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
      markFormGroupTouched(this.loginForm);
      this.toaster.showErrorToast("response.message");

    }
  }
  private loginApiCall(reqModel: ILoginRequests): void {
    this.isLoading = true; // Start loading

    this._authservice.loginUser(reqModel)
      .pipe(
        finalize(() => {
          this.isLoading = false; // Ensure loading spinner is turned off after request completes

          // Handle any cleanup logic, e.g., stopping the loader
        })
      )
      .subscribe({
        next: (response) => {
          if (response.flag) {
            debugger
            console.log("Response", response);

            this.userRole = this._userServices.getUserRoles().toString();

            if (this.userRole === "User") {
              this.toaster.showErrorToast("Invalid User");

              // Handle user-specific logic, e.g., remove token
              this._authservice.removeToken();
              // Optionally show error/toast message here if needed
              // this._toasterService.showErrorToast('Invalid credentials');
            } else if (this.userRole === "SuperAdmin" || this.userRole === "Admin") {
              this.toaster.showSuccessToast(response.message);

              // Navigate to the admin dashboard if admin is logged in
              this._routing.navigate(['../admin/dashboard']);
            }
          } else {
            this.toaster.showErrorToast(response.message);

            // Handle the case where login fails (e.g., invalid credentials)
            // this._toasterService.showWarningToast(response.message || 'Login failed!');
          }
        },
        error: (error) => {
          // Handle the error case, such as server errors or network issues
          // this._toasterService.showErrorToast(error.error?.error || 'Login failed!');
        }
      });
  }



  // Method to handle logout
  logout(): void {
    this._authservice.logout(); // Ensure you have a logout method in AuthService
    this._routing.navigate(['/auth/login']); // Redirect to login page after logout
  }
}










