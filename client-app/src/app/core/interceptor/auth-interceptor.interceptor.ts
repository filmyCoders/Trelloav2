import { Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthService } from "../services/api/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private zone: NgZone
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
  
    const modifiedReq = token ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    }) : req; // If token is null/undefined, don't modify the request
  
    return next.handle(modifiedReq).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) { // Handle 401 Unauthorized errors
            this.zone.run(() => {
              this.router.navigate(['/login']);
            });
          }
        }
        return throwError(() => new Error('An error occurred'));
      })
    );
  }
  
}
