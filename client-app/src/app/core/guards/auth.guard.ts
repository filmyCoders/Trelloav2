import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../../core/services/api/auth.service'; // Adjust path if necessary
import { UserService } from '../services/api/user.service';

/**
 * Guard that prevents navigation if user is not authenticated.
 * @param route
 * @param state
 * @returns
 */
export function requireAuthenticated(): CanActivateFn {
  return (ars: ActivatedRouteSnapshot, rss: RouterStateSnapshot) => {
    const service = inject(UserService);
    return service.isLoggedIn ? true : inject(Router).navigate(['/auth/login'])
  };
};