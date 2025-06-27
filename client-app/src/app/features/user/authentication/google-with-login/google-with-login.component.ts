import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';

declare global {
  interface Window {
    google: any; // Add this for type safety
  }
}

@Component({
  selector: 'app-google-with-login',
  templateUrl: './google-with-login.component.html',
  styleUrls: ['./google-with-login.component.css'],
})
export class GoogleWithLoginComponent implements OnInit {

  ngOnInit(): void {
    window.google.accounts.id.initialize({
      client_id: environment.googleLoginClientId, // Your client ID
      callback: (response: any) => {
        console.log('Google login response:', response);
        // Handle the Google login response here
        this.googleIdToken = response.credential;
        this.completeGoogleRegistration();
      },
    });

    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button')!,
      { theme: 'outline', size: 'large' } // Customize button style
    );
  }

  public googleIdToken: string | null = null;

  public completeGoogleRegistration(): void {
    if (!this.googleIdToken) {
      console.error('Google ID Token is missing.');
      return;
    }

    // Perform your external login action here
    console.log('Completing registration with Google ID token:', this.googleIdToken);
  }
}
