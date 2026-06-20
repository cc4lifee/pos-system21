import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SideNavService } from '../../services/side-nav.service';
import { SideNavMenuItems } from '../side-nav-menu-items/side-nav-menu-items';
import { AuthService } from '../../../../../auth/services/auth.service';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './side-nav-pane.scss',
})
export class SideNavPane {
  public readonly sideNavService = inject(SideNavService);
  public readonly authService = inject(AuthService);
  public readonly router = inject(Router);

  public onToggleDesktopMinimize(): void {
    this.sideNavService.toggleDesktopMinimize();
  }

  public onToggleMobile(): void {
    this.sideNavService.toggleMobileDrawer();
  }

  public onMobileItemSelected(): void {
    this.sideNavService.closeMobile();
  }

  public async logout() {
    this.authService.logout();
    await this.router.navigate(['/auth/login']);
  }
}
