import { Routes } from '@angular/router';
import { notAuthenticatedGuard } from './auth/guards/not-authenticated.guard';
import { ColorPalette } from './shared/components/color-palette/color-palette';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes),
    // canMatch: [notAuthenticatedGuard],
  },

  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.dashboardRoutes),
    // canMatch: [notAuthenticatedGuard],
  },

  

  
];
