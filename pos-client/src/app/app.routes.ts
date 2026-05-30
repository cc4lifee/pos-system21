import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { ColorPalette } from './shared/components/color-palette/color-palette';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
    // canMatch: [AuthGuard],
    data: { requireAuth: false },
  },

  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
    // canMatch: [AuthGuard],
  },

  // Redirect any unknown paths to the dashboard
  { path: '**', redirectTo: 'dashboard' },
];
