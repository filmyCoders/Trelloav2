import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/api/user.service';

export function requireAnonymous(): CanActivateFn {
  return (ars: ActivatedRouteSnapshot, rss: RouterStateSnapshot) => {
    const service = inject(UserService);
    return !service.isLoggedIn   ? true : inject(Router).navigate(['/home'])
  };
}

export function requireAnonymousAdmin(): CanActivateFn {
  return (ars: ActivatedRouteSnapshot, rss: RouterStateSnapshot) => {
    const service = inject(UserService);
    return !service.isAdminLoggedIn   ? true : inject(Router).navigate(['admin/dashboard'])
  };
}

