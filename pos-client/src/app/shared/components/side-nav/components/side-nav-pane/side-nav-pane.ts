import { AfterViewInit, Component, effect, inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './side-nav-pane.scss',
})
export class SideNavPane {
  protected readonly sideNav = inject(SideNavService);

  onToggleDesktopMinimize(): void {
    this.sideNav.toggleDesktopMinimize();
  }

  onToggleMobile(): void {
    this.sideNav.toggleMobileDrawer();
  }

  onMobileItemSelected(): void {
    this.sideNav.closeMobile();
  }
}
