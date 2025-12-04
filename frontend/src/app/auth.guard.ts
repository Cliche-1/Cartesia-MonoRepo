import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from './services/api.service';

export const authGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);
  if (api.isAuthenticated()) return true;
  router.navigateByUrl('/login');
  return false;
};

