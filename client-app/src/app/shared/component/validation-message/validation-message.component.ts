import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-validation-message',
  templateUrl: './validation-message.component.html',
  styleUrl: './validation-message.component.css'
})
export class ValidationMessageComponent {

      @Input() validationMessage: string = '';
      @Input() showValidationMessage: boolean = false;
      @Input() SuccessGreen: boolean = false;

    }
    

