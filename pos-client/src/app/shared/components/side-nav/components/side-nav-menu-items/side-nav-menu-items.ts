import {
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SideNavService } from '../../services/side-nav.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-side-nav-menu-items',
  standalone: true,
  imports: [MatButtonModule, RouterModule, MatTooltipModule],
  templateUrl: './side-nav-menu-items.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './side-nav-menu-items.scss',
})
export class SideNavMenuItems {
  protected readonly sideNavService = inject(SideNavService);
  protected readonly active = signal(false);
  @ViewChild('menu') menu?: ElementRef;

  readonly menuItems = [
    { id: 'terminal', route: ['/register/terminal'], icon: 'shopping_cart', label: 'Terminal' },
    {
      id: 'pending-orders',
      route: ['/register/pending-orders'],
      icon: 'schedule',
      label: 'Pending Orders',
    },
    {
      id: 'dashboard',
      route: ['/management/dashboard'],
      icon: 'space_dashboard',
      label: 'Dashboard',
    },
    { id: 'orders', route: ['/management/orders'], icon: 'assignment', label: 'Orders' },
    { id: 'products', route: ['/management/products'], icon: 'package_2', label: 'Products' },
    { id: 'categories', route: ['/management/categories'], icon: 'category', label: 'Categories' },
    {
      id: 'color-palettes',
      route: ['/management/color-palette'],
      icon: 'palette',
      label: 'Color Palettes',
    },
  ];

  protected openMenu(): void {
    if ((!this.active() || this.sideNavService.isMinimized()) && this.menu !== undefined)
      this.menu.nativeElement.style.display = 'flex';
  }

  protected closeMenu(): void {
    if ((!this.active() || this.sideNavService.isMinimized()) && this.menu !== undefined)
      this.menu.nativeElement.style.display = 'none';
  }
}
