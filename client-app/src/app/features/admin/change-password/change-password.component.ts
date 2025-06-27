import { Component } from '@angular/core';
import { IChangePasswordReq } from '../../../core/models/request/user-request.param';
import { BaseComponent } from '../../../shared/component/base/base.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/api/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { markFormGroupTouched } from '../../../shared/validators/validators';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent extends BaseComponent {
  public isLoading: boolean = false;
   // Individual visibility states for each input field
   public showCurrentPassword: boolean = false;
   public showNewPassword: boolean = false;
   public showReNewPassword: boolean = false;
   
protected override onInit(): void {
}
protected override onViewInit(): void {
}
protected override onDestroy(): void {
}
passwordModel!:IChangePasswordReq

public passwordChangeForm = new FormGroup({
  oldPassword: new FormControl('', [Validators.required, Validators.minLength(6),
    Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/)
]),
  newPassword: new FormControl('', [Validators.required, Validators.minLength(6),
    Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/)
]),
  reNewPassword: new FormControl('', [Validators.required , Validators.minLength(6),
    Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/)
]),
});
constructor(private _userServices: UserService, private route: ActivatedRoute,
  private router: Router) {

  super();
//  this._getUser()

  console.log("Users Component Initialized");
}
 // Toggle show/hide for current password
 public toggleShowCurrentPassword(): void {
  this.showCurrentPassword = !this.showCurrentPassword;
}

// Toggle show/hide for new password
public toggleShowNewPassword(): void {
debugger
  this.showNewPassword = !this.showNewPassword;

}

// Toggle show/hide for confirm new password
public toggleShowReNewPassword(): void {
  this.showReNewPassword = !this.showReNewPassword;
}


public changePassword(): void {
  debugger

  if (this.passwordChangeForm.value.newPassword !== this.passwordChangeForm.value.reNewPassword) {
    this.passwordChangeForm.controls['reNewPassword'].setErrors({ mismatch: true });
  }   
  let reqModel: IChangePasswordReq = {
    currentPassword: this.passwordChangeForm.controls["oldPassword"].value ?? "",
    newPassword: this.passwordChangeForm.controls["newPassword"].value ?? "",
  };


  // Validate the form
  if (this.passwordChangeForm.valid) {
    debugger
    // Submit the update request
    this.updateSubmit(reqModel);
  } else {
    // Mark form fields as touched to trigger validation messages
    markFormGroupTouched(this.passwordChangeForm);
  }
}
private updateSubmit(reqModel: IChangePasswordReq) {
  debugger
  this.isLoading = true; // Start loading

  this._userServices.changePassword(reqModel)
    .pipe(
      finalize(() => {
        this.isLoading = false; // Ensure loading spinner is turned off after request completes
      })
    )
    .subscribe({
      next: (response) => {
        // Close the modal after success
        if(response.flag){
          this.toaster.showSuccessToast(response.message);

        }
        else{
          this.toaster.showErrorToast(response.message);

        }

        // Optionally show a success message (toast)
        //  this.toaster.showSuccessToast('Role updated successfully!');

        // Refresh the roles list
      },
      error: (error) => {
        console.error('Error updating role:', error);
        this.toaster.showErrorToast(error);

        // Optionally show an error message (toast)
        //     this.toaster.showErrorToast(error.error?.error || 'Role update failed!');
      }
    });
}


}
