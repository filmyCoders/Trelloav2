import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-loader',
  templateUrl: './admin-loader.component.html',
  styleUrl: './admin-loader.component.css'
})
export class AdminLoaderComponent {
  @Input() isLoading: boolean = false;
  constructor(){ 
   
    }
}
