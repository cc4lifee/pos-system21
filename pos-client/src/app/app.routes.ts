import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { ColorPalette } from './shared/components/color-palette/color-palette';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
    canMatch: [AuthGuard],
    data: { requireAuth: false },
  },

  {
    path: '',
    component: MainLayout,
    canMatch: [AuthGuard],
    children: [
      {
        path: 'management',
        loadChildren: () =>
          import('./management/management.routes').then((m) => m.managementRoutes),
      },
      {
        path: 'register',
        loadChildren: () => import('./register/register.routes').then((m) => m.registerRoutes),
      },
      { path: '', redirectTo: 'management', pathMatch: 'full' },
    ],
  },
];
