import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { CurrentUserService } from '../services/auth/current-user.service';

export const myAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const currentUser = inject(CurrentUserService);
  const router = inject(Router);

  const authData = route.data['auth'] as MyAuthRouteData | undefined;
  const requireAuth = authData?.requireAuth ?? route.data['requireAuth'] === true;
  const requireAdmin = authData?.requireAdmin ?? route.data['requireAdmin'] === true;
  const requireManager = authData?.requireManager ?? route.data['requireManager'] === true;
  const requireEmployee = authData?.requireEmployee ?? route.data['requireEmployee'] === true;

  const isAuth = currentUser.isAuthenticated();

  if (requireAuth && !isAuth) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (!requireAuth) {
    return true;
  }

  const user = currentUser.snapshot;
  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (requireAdmin && !user.isAdmin) {
    router.navigate([currentUser.getDefaultRoute()]);
    return false;
  }

  if (requireManager && !user.isManager) {
    router.navigate([currentUser.getDefaultRoute()]);
    return false;
  }

  if (requireEmployee && !user.isEmployee) {
    router.navigate([currentUser.getDefaultRoute()]);
    return false;
  }

  return true;
};

export interface MyAuthRouteData {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireManager?: boolean;
  requireEmployee?: boolean;
}

export function myAuthData(data: MyAuthRouteData): { auth: MyAuthRouteData } {
  return { auth: data };
}
