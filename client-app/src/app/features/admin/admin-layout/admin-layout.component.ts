import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, IUser } from '../../../core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {
  public UserName!:string 
  isDarkMode = false;
  isSidebarClosed = false;
  modeText = 'Dark Mode';
  currentUser: IUser | null = null;
  private subscriptions: Subscription = new Subscription();

constructor(private _routing: Router, private _authservice:AuthService
  ){
    this.UserName = JSON.parse(localStorage.getItem('currentUser') || '{}');
  }
  ngOnInit(): void {
    this.subscriptions.add(
      this._authservice.getCurrentUserData().subscribe()
    );

    this.subscriptions.add(
      this._authservice.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );

  }

  toggleMode() {
    this.isDarkMode = !this.isDarkMode;
    this.modeText = this.isDarkMode ? 'Light Mode' : 'Dark Mode';
    document.body.classList.toggle('dark', this.isDarkMode);  // Apply dark mode to the body
  }

  toggleSidebar() {
    this.isSidebarClosed = !this.isSidebarClosed;
  }

  openSidebar() {
    if (this.isSidebarClosed) {
      this.isSidebarClosed = false;
    }
  }
  // Method to handle logout
  logout(): void {
    this.UserName=""
    this._authservice.adminLogout(); // Ensure you have a logout method in AuthService
    this._routing.navigate(['admin/login']); // Redirect to login page after logout
  }
}
