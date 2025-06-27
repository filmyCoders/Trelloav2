import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '..';
import { UserService } from '../services/api/user.service';

export const adminGuard: CanActivateFn = (route, state) => {
  return true;
};
export function requireAuthenticatedAdmin(): CanActivateFn {
  return (ars: ActivatedRouteSnapshot, rss: RouterStateSnapshot) => {
    const service = inject(UserService);
    const authService = inject(AuthService);
    const router = inject(Router);

    if (service.isAdminLoggedIn) {
      if (service.isTokenExpired()) {
        authService.logout(); // Log out the user
        router.navigate(['/admin/login']); // Redirect to login page
        return false; // Prevent access
      }
      return true;
    }
    else {
      inject(Router).navigate(['/admin/login']);
      return false;
    }
  };
};