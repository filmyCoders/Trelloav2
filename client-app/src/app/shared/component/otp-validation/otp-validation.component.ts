import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChildren,
  QueryList,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-otp-validation',
  templateUrl: './otp-validation.component.html',
  styleUrls: ['./otp-validation.component.css'],
})
export class OtpValidationComponent implements OnInit, OnDestroy {
  @Input() otpLength = 6;
  @Input() validationType!: 'resetPassword' | 'changeEmail' | 'orderConfirmation';
  @Output() formSubmit = new EventEmitter<any>();
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  @Output() resendOtp = new EventEmitter<boolean>();

  public otpValidationForm!: FormGroup;
  public countdown = 12;
  private countdownInterval!: ReturnType<typeof setInterval>;
  public showNewPassword = false;
  public otpvalid = true;

  ngOnInit(): void {
    this.initializeForm();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownInterval);
  }

  initializeForm(): void {
    const controls: { [key: string]: FormControl } = {};

    for (let i = 0; i < this.otpLength; i++) {
      controls[`otp${i}`] = new FormControl('', [Validators.required, Validators.pattern('[0-9]')]);
    }

    if (this.validationType === 'resetPassword') {
      controls['newPassword'] = new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/),
      ]);
    } else if (this.validationType === 'changeEmail') {
      controls['newEmail'] = new FormControl('', [Validators.required, Validators.email]);
    } else if (this.validationType === 'orderConfirmation') {
      controls['orderId'] = new FormControl('', [Validators.required, Validators.pattern('[0-9]{6,}')]);
    }

    this.otpValidationForm = new FormGroup(controls);
  }

  getOtpControls(): string[] {
    return Object.keys(this.otpValidationForm.controls).filter(control => control.startsWith('otp'));
  }

  getOtpValue(): string {
    return this.getOtpControls().map(control => this.otpValidationForm.get(control)?.value || '').join('');
  }

  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      }
    }, 1000);
  }

  toggleShowNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  onInputChange(event: any, index: number): void {
    const input = event.target;
    if (/^[0-9]$/.test(input.value) && index < this.otpLength +1) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    } else {
      input.value = ''; // Clear invalid input
    }
  }

  onBackspace(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && index > 0 && !(event.target as HTMLInputElement).value) {
      this.otpInputs.toArray()[index -1].nativeElement.focus();
    }
  }

  onSubmit(): void {
    if (!this.isOtpComplete() || !this.otpValidationForm.valid) {
      this.otpvalid = false;
      this.markFormGroupTouched(this.otpValidationForm);
      return;
    }

    this.otpvalid = true;
    const otpString = this.getOtpValue();
    const formData = { otp: otpString, ...this.otpValidationForm.value };
    console.log(formData.value)
    this.formSubmit.emit(formData);
  }

  resendOtpCall(): void {
    this.resendOtp.emit(true);
  }

  private isOtpComplete(): boolean {
    return this.getOtpValue().length === this.otpLength;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  get formattedCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
