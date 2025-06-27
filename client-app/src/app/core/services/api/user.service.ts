import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IPagedRequest, IPaginatedList } from '../../models/paginations/paged.interface';
import { CHANGE_PASSWORD_USER, EMAIL_EXIST_OR_NOT, GET_CURRENT_LOGIN_USER, GET_USER_DETAILS_BY_EMAIL, GET_USER_DETAILS_BY_EMAILS, RESET_PASSWORD_SEND_OTP, RESET_PASSWORD_VALIDATE_OTP, ResponseBase, USER_LIST, USER_PROFILE_IMAGE, update_PROFILE_USER } from '../..';
import { BehaviorSubject, Observable, catchError, concat, tap, throwError } from 'rxjs';
import { IUserFilter } from '../../models/filters/IUserFilter.model';
import { IUser } from '../../models/user.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IChangePasswordReq, IEmailExistReq, IUserUpdateReq, UserEmailsRequest } from '../../models/request/user-request.param';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _jwtHelper = new JwtHelperService();
  private _currentUser: IUser | undefined;

  constructor(private _httpClient: HttpClient,private _router:Router) {}

  getUserByEmail(emails: string[]): Observable<ResponseBase<IUser[]>> {
    return this._httpClient.post<ResponseBase<IUser[]>>(GET_USER_DETAILS_BY_EMAILS, { emails });
  }

 
   
  getCurrentUser(): Observable<ResponseBase<IUser>> {
    
    return this._httpClient.get<ResponseBase<IUser>>(GET_CURRENT_LOGIN_USER);
  } 
  updateProfileUser(user: FormData): Observable<ResponseBase<any>> {

    
    console.log("User data",user)
    return this._httpClient.post<ResponseBase<boolean>>(update_PROFILE_USER, user);
  }
  changePassword(req: IChangePasswordReq): Observable<ResponseBase<any>> {

    return this._httpClient.post<ResponseBase<boolean>>(CHANGE_PASSWORD_USER, req);
  }
 
  emailExistOrNot(req: IEmailExistReq): Observable<ResponseBase<any>> {

    return this._httpClient.post<ResponseBase<boolean>>(EMAIL_EXIST_OR_NOT, req);
  }
  getUserDetailsByEmails(email: string): Observable<ResponseBase<IUser>> {
    const url = `${GET_USER_DETAILS_BY_EMAIL}?email=${encodeURIComponent(email)}`;
    return this._httpClient.get<ResponseBase<IUser>>(url);
  }
  
 

  resetPasswordSendOtp(): Observable<ResponseBase<boolean>> {
    return this._httpClient.post<ResponseBase<boolean>>(RESET_PASSWORD_SEND_OTP, {}, { responseType: 'json' }).pipe(
        catchError((error) => {
            console.error('Error sending OTP:', error);
            return throwError(() => new Error('Failed to send OTP. Please try again later.'));
        })
    );
}


resetPasswordValidateOtp(otp: string, newPassword: string): Observable<ResponseBase<any>> {
  const params = new HttpParams()
    .set('otp', otp)
    .set('newPassword', newPassword);

  return this._httpClient.post<ResponseBase<boolean>>(RESET_PASSWORD_VALIDATE_OTP, null, { params });
}

  public initializeService(): Observable<any> {
    return concat(
      this.getCurrentUser().pipe(tap((res) => this._currentUser = res.data)));
  }


  getUserRoles(): string[] {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode the token using jwtHelper
      const decodedToken = this._jwtHelper.decodeToken(token);
      // Extract the role from the token
      return decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
    }
    return [];
  }

  get isAdminLoggedIn(): boolean {
    const tokenExists = !!localStorage.getItem("token");
    const tokenExpired = tokenExists ? this._jwtHelper.isTokenExpired() : true;

  const userRoles = this.getUserRoles();

    return tokenExists && tokenExpired && userRoles.includes("SuperAdmin");
  }
  
  get isLoggedIn(): boolean {
    const tokenExists = !!localStorage.getItem("token");
    const tokenExpired = tokenExists ? this._jwtHelper.isTokenExpired() : true;
    const userRoles = this.getUserRoles();

    return tokenExists && tokenExpired && userRoles.includes("User") ;
  }
  // Check if the token is expired
  isTokenExpired(): boolean {
    const token = localStorage.getItem("token");
    return token ? this._jwtHelper.isTokenExpired(token) : true;
  }


  UserListwithPagination(request: IPagedRequest<IUserFilter>): Observable<ResponseBase<IPaginatedList<IUser>>> {
    // Build the HttpParams with all query parameters if needed
    const httpOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    console.log("Request Payload:", request);

    return this._httpClient.post<ResponseBase<IPaginatedList<IUser>>>(USER_LIST, request, httpOptions);
}

getImage(fileName: string): Observable<Blob> {
  console.log(fileName)
  const url = `${USER_PROFILE_IMAGE}${fileName}`; // Construct the URL dynamically
  return this._httpClient.get(url, { responseType: 'blob' });
}


}
