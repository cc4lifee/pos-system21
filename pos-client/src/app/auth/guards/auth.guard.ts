import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanMatchFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await authService.checkStatus();
  const requireAuth = route.data?.['requireAuth'] !== false; // default: true

  if (requireAuth && !isAuthenticated) {
    router.navigateByUrl('/auth/login');
    return false;
  }

  if (!requireAuth && isAuthenticated) {
    return router.createUrlTree(['/']);
  }

  return true;
};
