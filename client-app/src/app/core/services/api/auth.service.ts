import { Injectable } from '@angular/core';
import { IExternalAuthRequest, ILoginRequests } from '../../models/request/identity/login-req';
import { ILoginResponse } from '../../models/response/identity/login-response';
import { BehaviorSubject, Observable, catchError, from, map, switchMap, tap, throwError, timer } from 'rxjs';
import { ResponseBase } from '../../models/response/Ibase-response';
import { CLIENT_URL, FORGOT_PASSWORD_RESET, FORGOT_PASSWORD_SENT_EMAIL, GET_CURRENT_LOGIN_USER, IUser, LOGIN_USER, LOGIN_WITH_GOOGLE } from '../..';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IForgotPassword } from '../../models/request/user-request.param';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser: IUser | undefined;
  get currentUser() { return this._currentUser; }
  private currentUserSubject = new BehaviorSubject<IUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.hasToken());
  private readonly SESSION_DURATION = 3222 * 60 * 1000; // 3 minutes in milliseconds
  private sessionStartTime: number | null = null;
  private timeoutSubscription: any;
  private _jwtHelper = new JwtHelperService();
  constructor(private _httpClient: HttpClient,private _router:Router,private authService: SocialAuthService,) { 
       this.checkSessionTimeout();
  }

  getCurrentUserData(): Observable<ResponseBase<IUser>> {
    return this._httpClient.get<ResponseBase<IUser>>(GET_CURRENT_LOGIN_USER).pipe(
      tap(response => {
        if (response.data) {
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }
  
  updateUser(updatedUser: IUser): void {
    this.currentUserSubject.next(updatedUser);
  }


  loginUser(user: ILoginRequests): Observable<ResponseBase<ILoginResponse>> {
    return this._httpClient.post<ResponseBase<ILoginResponse>>(LOGIN_USER, user).pipe(
      tap(response => {
        if (response.flag) {
          this.storeToken(response.data);
          localStorage.setItem('currentUser', JSON.stringify(response.data.fullName));

        this.isLoggedInSubject.next(true);
        // this.scheduleSessionTimeout();

        }
      })
    );
  }
  

  public authenticateWithGoogle(
    request: any
  ): Observable<ResponseBase<string>> {
    return this._httpClient.post<ResponseBase<string>>(
      LOGIN_WITH_GOOGLE,
      request
    );
  }




 /**
   * Sends the Google ID token to the backend for verification.
   */
 externalLogin(idToken: string): Observable<ILoginResponse> {
  const request: IExternalAuthRequest = { idToken };

  return this._httpClient.post<ResponseBase<ILoginResponse>>(LOGIN_WITH_GOOGLE, request).pipe(
    map(response => {
      if (response.flag) {
        return response.data; // Returning login response data if successful
      } else {
        throw new Error(response.message || 'Login failed'); // Throwing meaningful error message
      }
    }),
    catchError(error => {
      console.error('External login failed:', error);
      return throwError(() => new Error(error.error?.message || 'An error occurred while logging in.'));
    })
  );
}

/**
 * Initiates Google login and calls the API with the received ID token.
 */
googleLogin(): Observable<ILoginResponse> {
  return from(this.authService.signIn(GoogleLoginProvider.PROVIDER_ID)).pipe(
    switchMap((user: SocialUser) => this.externalLogin(user.idToken)), // Calls externalLogin after getting the token
    map(response => {
      localStorage.setItem('token', response.token); // Store token in localStorage
      return response;
    }),
    catchError(error => {
      console.error('Google login failed:', error);
      return throwError(() => new Error(error.message || 'Google login failed. Please try again.'));
    })
  );
}



  forgotPasswordSendEmail(email: string): Observable<ResponseBase<boolean>> {
    const clientUrlForgetPassword = CLIENT_URL + 'admin/forgot-password';
    const payload = {
        email: email,
        clientUrlForgetPassword: clientUrlForgetPassword
    };

    return this._httpClient.post<ResponseBase<boolean>>(FORGOT_PASSWORD_SENT_EMAIL, payload);
}

forgotPassword(user: IForgotPassword): Observable<ResponseBase<boolean>> {
  
  return this._httpClient.post<ResponseBase<boolean>>(FORGOT_PASSWORD_RESET, user);
}


  getUserRoles(): string[] {
    const token = this.getToken();
    if (token) {
      // Decode the token using jwtHelper
      const decodedToken = this._jwtHelper.decodeToken(token);
      // Extract the role from the token
      return decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
    }
    return [];
  }
  private checkSessionTimeout(): void {
    const token = this.getToken();
    const sessionStartTime = Number(localStorage.getItem('sessionStartTime'));
    if (token && sessionStartTime) {
      const elapsed = Date.now() - sessionStartTime;
      if (elapsed > this.SESSION_DURATION) {
        this.logout();
      } else {
        const remainingTime = this.SESSION_DURATION - elapsed;
        this.timeoutSubscription = timer(remainingTime).subscribe(() => this.logout());
      }
    }
  }
  
  get isLoggedInStatus(): boolean {
    return !!this.getToken();
  }
  private hasToken(): boolean {
    return !!localStorage.getItem('token'); // Adjust this if you use another storage method
  }

  


  logout(): void {
    this.removeToken();
    localStorage.removeItem('sessionStartTime'); // Remove session start time on logout
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null); // ✅ Clear user data on logout

    this._router.navigate(['auth/login']);
  }

  adminLogout(): void {
    this.removeToken();
    localStorage.removeItem('sessionStartTime'); // Remove session start time on logout
    this.isLoggedInSubject.next(false);
    this._router.navigate(['auth/login']);
  }

  removeToken(){
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('sessionStartTime'); // Store session start time
   // this.isLoggedInSubject.next(true);
  }
  storeToken(data: ILoginResponse): void {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('sessionStartTime', Date.now().toString()); // Store session start time
   // this.isLoggedInSubject.next(true);
  }

 // Get the current logged-in user
 getUser() {
  return this.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
}

  getCurrentUser(): Observable<ResponseBase<IUser>> {

    return this._httpClient.get<ResponseBase<IUser>>(GET_CURRENT_LOGIN_USER);

    
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  
}
