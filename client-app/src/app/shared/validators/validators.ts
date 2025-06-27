import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

// Utility function to handle mobile number input
export function handleMobileNoInput(event: Event, formControl: AbstractControl): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
  
    // Remove non-numeric characters
    value = value.replace(/\D/g, '');
  
    // Check if the first digit is zero and remove it
    if (value.startsWith('0')) {
      value = value.substring(1);
    }
  
    // Limit to 10 digits
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
  
    input.value = value;
    // Update form control value
    formControl.setValue(value, { emitEvent: false });
  
    // Set error if value length is not 10
    if (value.length !== 10) {
      formControl.setErrors({ invalidMobileNumber: 'Mobile number must be exactly 10 digits.' });
    } else {
      formControl.setErrors(null); // Clear the error if valid
    }
  }
  
  
  // Validator for matching passwords
  export function passwordMatchValidator(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);
  
      if (control && matchingControl && control.value !== matchingControl.value) {
        return { mismatch: true };
      }
      return null;
    };
  }
  
  export function markFormGroupTouched(formGroup: FormGroup): void {
    // Mark all controls as touched for validation
    Object.values(formGroup.controls).forEach((control: AbstractControl) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        markFormGroupTouched(control); // Recursive call for nested FormGroups
      }
    });
  }
// Validator for password strength
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    
    // Check for required conditions
    const hasUpperCase = /[A-Z]/.test(value); // At least one uppercase letter
    const hasLowerCase = /[a-z]/.test(value); // At least one lowercase letter
    const hasNumber = /[0-9]/.test(value);    // At least one number
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value); // At least one special character
    const hasMinimumLength = value.length >= 6; // Minimum length of 6 characters

    const valid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && hasMinimumLength;
    
    return valid ? null : { weakPassword: { value: control.value } };
  };
}

// Custom validator function to check if the event date is in the future
export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    let currentDate = new Date();
    let selectedDate = new Date(control.value);

    // Check if selected date is less than current date and time
    if (selectedDate <= currentDate) {
      return { futureDate: true }; // Custom error key
    }
    return null; // Valid
  };
}

















  
  //this is Use in a Componets

//   markFormGroupTouched(formGroup: FormGroup) {
//     Object.values(formGroup.controls).forEach(control => {
//       control.markAsTouched();
//       if (control instanceof FormGroup) {
//         this.markFormGroupTouched(control);
//       }
//     });
//   }
