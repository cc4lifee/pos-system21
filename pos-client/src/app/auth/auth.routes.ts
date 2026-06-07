import { Routes } from '@angular/router';

import { AuthPage } from './pages/auth-page/auth-page';
import { Login } from './component/login/login';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthPage,
    children: [
      {
        path: 'login',
        component: Login,
      },
      {
        path: '**',
        redirectTo: 'login',
      },
    ],
  },
];
