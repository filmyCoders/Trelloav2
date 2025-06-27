import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from './component/base/base.component';
import { ValidationMessageComponent } from './component/validation-message/validation-message.component';
import { AdminLoaderComponent } from './component/admin-loader/admin-loader.component';
import { DataLoaderComponent } from './component/data-loader/data-loader.component';
import { AdminToasterComponent } from './component/admin-toaster/admin-toaster.component';
import { OtpValidationComponent } from './component/otp-validation/otp-validation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TogglePasswordDirective } from './directive/togglepassword.directive';
import { ImageshowComponent } from './component/imageshow/imageshow.component';
import { BackgroundImageDirective } from './directive/background-image.directive';



@NgModule({
  declarations: [
    ValidationMessageComponent,
    DataLoaderComponent,
    AdminLoaderComponent,
    DataLoaderComponent,
    AdminToasterComponent,
    OtpValidationComponent,
    TogglePasswordDirective,
    BackgroundImageDirective,
    ImageshowComponent,
    BackgroundImageDirective
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule // Add ReactiveFormsModule here

  ],
  exports:[ AdminToasterComponent, AdminLoaderComponent,
    ValidationMessageComponent,
    OtpValidationComponent,
    TogglePasswordDirective,
    BackgroundImageDirective,
    ImageshowComponent

  ]
})
export class SharedModule { }
