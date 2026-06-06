import { Routes } from '@angular/router';

export const registerRoutes: Routes = [
  {
    path: 'terminal',
    loadComponent: () =>
      import('./terminal/pages/terminal-page/terminal-page').then((m) => m.TerminalPage),
  },
  {
    path: 'pending-orders',
    loadComponent: () =>
      import('./pending-orders/pages/pending-orders-page/pending-orders-page').then(
        (m) => m.PendingOrdersPage,
      ),
  },
  { path: '', redirectTo: 'terminal', pathMatch: 'full' },
];
