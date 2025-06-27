import { Component } from '@angular/core';
import { BaseComponent } from '../../../../shared/component/base/base.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { IForgotPassword } from '../../../../core/models/request/user-request.param';
import { markFormGroupTouched } from '../../../../shared/validators/validators';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent extends  BaseComponent {
  
  public isLoading: boolean = false;
  public _token:string="" //Token Reset Password 
  public _userName:string="";
  public isPasswordReset = false; // Flag to determine if we're on the reset password page

  forgotPasswordSendEmailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  public forgotPasswordForm = new FormGroup({
   
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/)
  ]),
    reNewPassword: new FormControl('', [Validators.required , Validators.minLength(6),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/)
  ]),
  });
  
   
  constructor(private _auth:AuthService,private route: ActivatedRoute,private _router: Router){
    super();
  }
  protected override onInit(): void {
    this.route.queryParams.subscribe(params => {
      this._token = params['token'];
      this._userName = params['email'];

      if (this._token && this._userName) {
        this.isPasswordReset = true;
      }
      else{
         this._router.navigate(['auth/forgot-password']); // Optional: redirect to forgot-password if query params are missing

      }
    });
   
  }
  protected override onViewInit(): void {
  }
  protected override onDestroy(): void {
  }
  onSubmit() {
    if (this.forgotPasswordSendEmailForm.valid) {
      const email = this.forgotPasswordSendEmailForm.value.email;

      // Call API to send reset password link
      console.log('Sending reset link to:', email);

      // Show success message or navigate
      alert('Reset link has been sent to your email.');
    }
  }


  public sendEmailValidate()
  {
   
   let email = this.forgotPasswordSendEmailForm.get('email')?.value;

  
 // Handle the login logic here (e.g., make an API call to authenticate the user)

 if (this.forgotPasswordSendEmailForm.valid) {
  this.sendEmailLink(email);
} else {
  // Mark form fields as touched to trigger validation messages
  markFormGroupTouched(this.forgotPasswordSendEmailForm);

}
}
private sendEmailLink(email:any){
  debugger
  this.isLoading = true; // Start loading

  this._auth.forgotPasswordSendEmail(email)
    .pipe(
      finalize(() => {
        this.isLoading = false; // Ensure loading spinner is turned off after request completes
      })
    )
    .subscribe({
      next: (response) => {
        console.log(response);
        if(response.flag){
          this.toaster.showSuccessToast(response.message);

        }
        else{
          this.toaster.showWarningToast(response.message);

        }
        // Handle successful response, e.g., navigate or show a success message
      },
      error: (error) => {
        console.error(error.error.message);
        this.toaster.showErrorToast(error.error?.message );

        // Handle error response, e.g., show an error message
      }
    });
}


public resetPasswordValidate(): void {
  debugger

  if (this.forgotPasswordForm.value.newPassword !== this.forgotPasswordForm.value.reNewPassword) {
    this.forgotPasswordForm.controls['reNewPassword'].setErrors({ mismatch: true });
  }   
  let reqModel: IForgotPassword = {
    newPassword: this.forgotPasswordForm.controls["newPassword"].value ?? "",
    token:this._token,
    userName:this._userName
     
  };


  // Validate the form
  if (this.forgotPasswordForm.valid) {
    debugger
    // Submit the update request
    this.forgotPassword(reqModel);
  } else {
    // Mark form fields as touched to trigger validation messages
    markFormGroupTouched(this.forgotPasswordForm);
  }
}
private forgotPassword(reqModel:IForgotPassword){
  debugger
  this.isLoading = true; // Start loading

  this._auth.forgotPassword(reqModel)
    .pipe(
      finalize(() => {
        this.isLoading = false; // Ensure loading spinner is turned off after request completes
      })
    )
    .subscribe({
      next: (response) => {
        console.log(response);
        if(response.flag){
          this.toaster.showSuccessToast(response.message);
          console.log(response)
        }
        else{
          this.toaster.showWarningToast(response.message);

        }
        // Handle successful response, e.g., navigate or show a success message
      },
      error: (error) => {
        console.error(error.error.message);
        this.toaster.showErrorToast(error.error?.message );

        // Handle error response, e.g., show an error message
      }
    });









  }

}
