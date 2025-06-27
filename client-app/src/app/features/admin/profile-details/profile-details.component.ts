import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService, IUser } from '../../../core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize, switchMap } from 'rxjs';
import { UserService } from '../../../core/services/api/user.service';
import { BaseComponent } from '../../../shared/component/base/base.component';
import { ActivatedRoute, Router } from '@angular/router';
import Modal from 'bootstrap/js/dist/modal';
import { IUserUpdateReq } from '../../../core/models/request/user-request.param';
import { handleMobileNoInput, markFormGroupTouched } from '../../../shared/validators/validators';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.css'
})
export class ProfileDetailsComponent extends BaseComponent {
  @ViewChild('editprofile') updateProfileModalContent!: ElementRef;
  private updateModal: Modal | null = null;

  public user!: IUser
  public isLoading: boolean = false;
  profileImagePreview: string | ArrayBuffer | null = null;
  selectedImageFile: File | null = null;

  public editForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    mobileNo: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]*$/)]),
    firstName: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]),
    middleName: new FormControl('', [Validators.pattern(/^[A-Za-z]*$/)]),
    lastName: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)])
  });
  constructor(private _userServices: UserService, private route: ActivatedRoute,private _authServices:AuthService,
    private router: Router) {

    super();
    this._getUser()

    console.log("Users Component Initialized");
  }

  protected override onInit(): void {

  }
  override ngAfterViewInit(): void {

    this.updateModal = new Modal(this.updateProfileModalContent.nativeElement);

  }
  protected override onViewInit(): void {

  }
  protected override onDestroy(): void {
 this.user
  }


  onMobileNoInput(event: Event): void {
    handleMobileNoInput(event, this.editForm.get('mobileNo')!);
  }

  onImageSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.selectedImageFile = fileInput.files[0];

      // Preview the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }


  public editProfile(): void {

    const formData = new FormData();

    formData.append('firstName', this.editForm.controls.firstName.value ?? "");
    formData.append('middleName', this.editForm.controls.middleName.value ?? "");
    formData.append('lastName', this.editForm.controls.lastName.value ?? "");
    formData.append('mobileNo', this.editForm.controls.mobileNo.value ?? "");
    formData.append('email', this.editForm.controls.email.value ?? "");
    
    if (this.selectedImageFile) {
      formData.append('newProfileImage', this.selectedImageFile);
    }
     let reqModel: IUserUpdateReq = {
      firstName: this.editForm.controls["firstName"].value ?? "",
      middleName: this.editForm.controls["middleName"].value ?? "",
      lastName: this.editForm.controls["lastName"].value ?? "",
      mobileNo: this.editForm.controls["mobileNo"].value ?? "",
      email: this.editForm.controls["email"].value ?? "",
      id: this.user.id,
      newProfileImage:this.selectedImageFile ??null
      

      //  profileImageUrl:this
    };


    // Validate the form
    if (this.editForm.valid) {
      debugger
      // Submit the update request
      this.updateSubmit(formData);
    } else {
      // Mark form fields as touched to trigger validation messages
      markFormGroupTouched(this.editForm);
    }
  }



  private updateSubmit(reqModel: FormData) {
    this.isLoading = true; // Start loading

    this._userServices.updateProfileUser(reqModel)
      .pipe(
        finalize(() => {
          this.isLoading = false; // Ensure loading spinner is turned off after request completes
        })
      )
      .subscribe({
        next: (response) => {
          console.log("Role updated successfully:", response);
          // Close the modal after success

          if(response.flag){
            this.toaster.showSuccessToast(response.message);
            this.updateModal?.hide();
            this._getUser();
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
          this.toaster.showErrorToast(error.message);

          // Optionally show an error message (toast)
          //     this.toaster.showErrorToast(error.error?.error || 'Role update failed!');
        }
      });
  }

  // Method to close the modal
  closeupdateModal(): void {
    this.updateModal?.hide();
  }

  public openEditUserModal(): void {

    this.profileImagePreview=this.user.profileImageUrl;
    this.editForm.controls.firstName.setValue(this.user.firstName);
    this.editForm.controls.middleName.setValue(this.user.middleName ?? "");
    this.editForm.controls.lastName.setValue(this.user.lastName);
    this.editForm.controls.mobileNo.setValue(this.user.mobileNo);
    this.editForm.controls.email.setValue(this.user.email ?? "");
    this.updateModal?.show();

  }

  loadProfileImage(user: IUser): void {
    this._userServices.getImage(user.profileImageUrl).subscribe(
      blob => {
        const objectURL = URL.createObjectURL(blob);
        console.log("Profile image",objectURL)
        user.profileImageUrl = objectURL;



        // Update the user's profile image URL to use the blob
      },
      error => {

        console.error('Error fetching prhhhhhhhhhofile image:', error);
        // Optionally set a fallback image
        debugger
        user.profileImageUrl = 'assets/defaultProfile.jpg'; // Fallback image

      }
    );
  }

  private _getUser() {
    this.isLoading = true;
    this._userServices.getCurrentUser()
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          if (response.flag) {
            this.user = response.data;
            console.log(response.data)
            this._authServices.updateUser(response.data)

           this. loadProfileImage(this.user)
            console.log(response)
            //  this.fullName = `${this.userModel.firstName} ${this.userModel.middleName ?? ''} ${this.userModel.lastName}`;
          } else {
            throw new Error(response.message);
          }
        },
        error: (error) => {
          console.error(error.error?.message);
          //    this.toaster.showErrorToast(error.error?.message || 'Failed to fetch user data');
        }
      });
  }



}
