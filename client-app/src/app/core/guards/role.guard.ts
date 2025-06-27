import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '..';
import { UserService } from '../services/api/user.service';

// export const roleGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService); // Inject AuthService
//   const router = inject(Router); // Inject Router for redirection

//   const userRoles = authService.getUserRoles(); // Fetch the user's roles
//   const requiredRoles = route.data['roles'] as Array<string>; // Get required roles from route data

//   // Check if user has the required roles
//   if (hasRequiredRole(userRoles, requiredRoles)) {
//     return true; // Allow access
//   } else {
//     // Redirect based on role
//     if (userRoles.includes('Admin')) {
//       router.navigate(['/auth/admin-login']); // Redirect admin to admin login
//     } else {
//       router.navigate(['/auth/user-login']); // Redirect non-admin users to user login
//     }
//     return false; // Block access
//   }
// };

// // Utility function to check if user has the required roles
// const hasRequiredRole = (userRoles: string[], requiredRoles: string[]): boolean => {
//   return requiredRoles.some(role => userRoles.includes(role)); // Return true if any role matches
// };