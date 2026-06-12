import { Routes } from '@angular/router';

export const registerRoutes: Routes = [
  {
    path: 'terminal',
    loadComponent: () =>
      import('./terminal/pages/terminal-page/terminal-page').then((m) => m.TerminalPage),
    title: 'Terminal',
  },
  {
    path: 'pending-orders',
    loadComponent: () =>
      import('./pending-orders/pages/pending-orders-page/pending-orders-page').then(
        (m) => m.PendingOrdersPage,
      ),
    title: 'Ordenes Pendientes',
  },
  { path: '', redirectTo: 'terminal', pathMatch: 'full' },
];
