import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

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

  // Signals temporales
  readonly productsCount = computed(() => 125);
  readonly categoriesCount = computed(() => 8);
  readonly pendingOrdersCount = computed(() => 5);
  readonly ordersCount = computed(() => 100);

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
        `${this.productsCount()} products across ${this.categoriesCount()} categories`,
      'Ordenes Pendientes': () => `${this.pendingOrdersCount()} orders waiting for payment`,
      Ordenes: () => `${this.ordersCount()} | Total revenue $12,345.67`,
      Categorias: () => `${this.categoriesCount()} categorias`,
      Dashboard: () => `Ultimas analíticas y reportes`,
      'Color Palette': () => ``,
    };

    return {
      title,
      subtitle: subtitleMap[title]?.() ?? '',
    };
  });
}
