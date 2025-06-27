import { Component } from '@angular/core';
import { BaseComponent } from '../../../../shared/component/base/base.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core';

@Component({
  selector: 'app-root-layout',
  templateUrl: './root-layout.component.html',
  styleUrl: './root-layout.component.css'
})
export class RootLayoutComponent extends BaseComponent{
  constructor( private _routing: Router, private _authservice:AuthService
    ){
    super();
  }
 
  protected override onInit(): void {
    debugger
  }
  protected override onViewInit(): void {
  }
  protected override onDestroy(): void {
  }
  // Method to handle logout
  logout(): void {
    this._authservice.logout(); // Ensure you have a logout method in AuthService
    this._routing.navigate(['/auth/login']); // Redirect to login page after logout
  }
}
