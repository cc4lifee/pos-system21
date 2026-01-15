import { Routes } from '@angular/router';

import { DashboardPage } from './page/dashboard-page/dashboard-page';
import { ColorPalette } from '../shared/components/color-palette/color-palette';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardPage,
    children: [
      {
        path: 'color',
        component: ColorPalette,
      },
      // {
      //   path: 'register',
      //   component: Register,
      // },
      // {
      //   path: '**',
      //   redirectTo: 'login',
      // },
    ],
  },
];
