import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
export const authGuard: CanActivateFn = (_route, state) =>{
    const auth=inject(AuthService);
    const router=inject(Router);
    if(auth.isAuthenticated()) return true;
    return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredRoles: string[] = route.data?.['roles'] ?? [];
  if (requiredRoles.length === 0) return true;
  const role = auth.getRole();
  if (role && requiredRoles.includes(role)) return true;
  return router.createUrlTree(['/auth/login']);
};
