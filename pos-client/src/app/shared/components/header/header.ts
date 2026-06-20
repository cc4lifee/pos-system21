import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { CategoryService } from '../../../management/categories/services/categories';
import { ProductService } from '../../../management/products/services/product-service';
import { OrderService } from '../../../management/orders/services/order-service';

interface HeaderData {
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-header',
  imports: [MatDividerModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);

  private readonly currentTitle = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => {
        let route: ActivatedRoute | null = this.activatedRoute;

        while (route?.firstChild) {
          route = route.firstChild;
        }

        return route?.snapshot?.title ?? '';
      }),
    ),
    { initialValue: '' },
  );

  readonly headerData = computed<HeaderData>(() => {
    const title = this.currentTitle();

    const subtitleMap: Record<string, () => string> = {
      Terminal: () => 'Tap a product to add it',
      Productos: () =>
        `${this.productService.productsCount()} products across ${this.categoryService.categoriesCount()} categories`,
      'Ordenes Pendientes': () =>
        `${this.orderService.pendingOrders().length} orders waiting for payment`,
      Ordenes: () =>
        `${this.orderService.orderStats()?.totalOrders} orders | Total revenue $${this.orderService.orderStats()?.totalRevenue}`,
      Categorias: () => `${this.categoryService.categoriesCount()} categorias`,
      Dashboard: () => `Ultimas analíticas y reportes`,
      'Color Palette': () => ``,
    };

    return {
      title,
      subtitle: subtitleMap[title]?.() ?? '',
    };
  });
}
