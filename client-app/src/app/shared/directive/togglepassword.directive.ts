import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appTogglePassword]'
})
export class TogglePasswordDirective {
  private isPasswordVisible: boolean = false;

  constructor(private el: ElementRef) {}

  @HostListener('click')
  togglePasswordVisibility() {
    const parent = this.el.nativeElement.parentElement;
    console.log('Parent element:', parent);
  
    if (parent) {
      const input = parent.querySelector('input');
      console.log('Input element:', input);
  
      if (input) {
        this.isPasswordVisible = !this.isPasswordVisible;
        input.type = this.isPasswordVisible ? 'text' : 'password';
        console.log('Password visible:', this.isPasswordVisible);
  
        const icon = this.el.nativeElement.querySelector('i');
        if (icon) {
          console.log('Icon found:', icon);
          icon.classList.toggle('fa-eye');
          icon.classList.toggle('fa-eye-slash');
        }
      }
    }
  }
  
}
