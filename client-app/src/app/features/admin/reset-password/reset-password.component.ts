import { Component, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { BaseComponent } from '../../../shared/component/base/base.component';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/api/user.service';
import { IUser } from '../../../core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ActiveLinksService } from '../../../core/services/common/active-links.service';
import { passwordStrengthValidator } from '../../../shared/validators/validators';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent extends BaseComponent {
  protected override onViewInit(): void {
  }
  public otp: string = "";
  public newPassword: string = ""
  public user!: IUser;
  public isLoading: boolean = false;
  public showOtpSection: boolean = false;
  private otpPromise: Promise<void> | null = null; // Holds the current OTP promise
  public otpsendRes: boolean = false; // Holds the OTP send result
  otpFormData: any



  constructor(
    private route: ActivatedRoute,
    private _userServices: UserService,
    private activeLinksService: ActiveLinksService,
    private router: Router
  ) {
    super();
    this._getUser();
  }

  protected override onInit(): void {
    this.activeLinksService.activeLink(true);
  }

  protected override onDestroy(): void {
    this.activeLinksService.activeLink(false);

  }

  private _getUser() {
    this.isLoading = true;
    this._userServices.getCurrentUser()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response.flag) {
            this.user = response.data;
          } else {
            throw new Error(response.message);
          }
        },
        error: (error) => console.error(error.error?.message),
      });
  }
  
  resendOtp(resend: any) {

    if (resend)
      this.sendOtp();


    console.log("this is Otp resend", resend)
  }
  // Function to send OTP
  public async sendOtp(): Promise<void> {

    if (this.isLoading || this.otpPromise) return; // Prevent duplicate requests if already loading
    this.isLoading = true;

    this.showOtpSection = true; // Display OTP section immediately

    this.otpPromise = new Promise((resolve, reject) => {
      this._userServices.resetPasswordSendOtp()
        .pipe(finalize(() => {
          this.isLoading = false;
          this.otpPromise = null; // Reset the promise after API call completes
        }))
        .subscribe({
          next: (response) => {
            if (response.flag) {
              this.otpsendRes = true;
              this.toaster.showSuccessToast(response.message);
              resolve(); // Resolve promise on successful response
            } else {
              this.toaster.showErrorToast(response.message);
              reject(new Error(response.message)); // Reject promise on failure
            }
          },
          error: (error) => {
            this.toaster.showErrorToast('Failed to send OTP.');
            reject(error); // Reject promise on error
          },
        });
    });

    try {
      await this.otpPromise;
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  }








  // Method to verify OTP and reset password
  public verifyOtp() {
    // if (this.otpValidationForm.invalid) {
    //   this.otpValidationForm.markAllAsTouched();
    //   return;
    // }

    this.isLoading = true;


    this._userServices.resetPasswordValidateOtp(this.otp, this.newPassword)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response.flag) {
            this.toaster.showSuccessToast('Password reset successfully.');
            this.router.navigate(['/profile-details']); // Redirect on successful reset
          } else {
            this.toaster.showErrorToast(response.message);
          }
        },
        error: (error) => this.toaster.showErrorToast('Failed to reset password.'),
      });
  }

  onOtpFormSubmit(formData: any) {

    // Extract values from formData
    const otp = formData.otp || ""; // Single string OTP
    const newPassword = formData.newPassword || ""; // New password
    this.otp = otp;
    this.newPassword = newPassword

    // Call verifyOtp function
    this.verifyOtp();
  }


}
