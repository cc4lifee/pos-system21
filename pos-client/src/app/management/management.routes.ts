import { Routes } from '@angular/router';

export const managementRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
    title: 'Dashboard',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./products/pages/products-page/products-page').then((m) => m.ProductsPage),
    title: 'Productos',
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./categories/pages/categories-page/categories-page').then((m) => m.CategoriesPage),
    title: 'Categorias',
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/pages/orders-page/orders-page').then((m) => m.OrdersPage),
    title: 'Ordenes',
  },
  {
    path: 'color-palette',
    loadComponent: () =>
      import('../shared/components/color-palette/color-palette').then((m) => m.ColorPalette),
    title: 'Color Palette',
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
