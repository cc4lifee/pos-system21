import { AfterViewInit, Component, effect, inject, ViewChild } from '@angular/core';
import { MatSidenavModule, MatDrawerContainer, MatDrawer } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SideNavService } from '../../services/side-nav.service';
import { SideNavMenuItems } from '../side-nav-menu-items/side-nav-menu-items';

@Component({
  selector: 'app-side-nav-pane',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    RouterModule,
    SideNavMenuItems,
  ],
  templateUrl: './side-nav-pane.html',
  styleUrl: './side-nav-pane.scss',
})
export class SideNavPane implements AfterViewInit {
  protected readonly sideNavService = inject(SideNavService);

  @ViewChild(MatDrawerContainer) drawerContainer?: MatDrawerContainer;

  ngAfterViewInit(): void {
    // Recalcular automáticamente el layout
    effect(() => {
      // Dependencias reactivas
      this.sideNavService.isMinimized();
      this.sideNavService.isMobile();
      this.sideNavService.isDrawerOpen();
      this.sideNavService.drawerMode();

      // Esperar al siguiente ciclo de render
      queueMicrotask(() => {
        this.drawerContainer?.updateContentMargins();
      });
    });
  }

  /**
   * Toggle minimizar (desktop/tablet)
   */
  onToggleMinimized(): void {
    this.sideNavService.toggleMinimized();
  }

  /**
   * Toggle drawer (móvil)
   */
  onToggleDrawer(): void {
    this.sideNavService.toggleDrawer();
  }

  /**
   * Cerrar drawer cuando se selecciona un item (móvil)
   */
  onMenuItemSelected(): void {
    if (this.sideNavService.isMobile()) {
      this.sideNavService.closeDrawer();
    }
  }
}
