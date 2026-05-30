import { Component, ElementRef, inject, signal, ViewChild, output } from '@angular/core';
import { SideNavService } from '../../services/side-nav.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-side-nav-menu-items',
  standalone: true,
  imports: [MatButtonModule, RouterModule, MatTooltipModule],
  templateUrl: './side-nav-menu-items.html',
  styleUrl: './side-nav-menu-items.scss',
})
export class SideNavMenuItems {
  protected readonly sideNavService = inject(SideNavService);
  private readonly router = inject(Router);

  protected readonly active = signal(false);
  @ViewChild('menu') menu?: ElementRef;

  // Output: emite cuando se selecciona un item
  readonly itemSelected = output<void>();

  protected openMenu(): void {
    if ((!this.active() || this.sideNavService.isMinimized()) && this.menu !== undefined)
      this.menu.nativeElement.style.display = 'flex';
  }

  protected closeMenu(): void {
    if ((!this.active() || this.sideNavService.isMinimized()) && this.menu !== undefined)
      this.menu.nativeElement.style.display = 'none';
  }

  protected navigateColorPalette(): void {
    this.router.navigate(['dashboard/color']);
    // Emitir que se seleccionó un item
    this.itemSelected.emit();
  }
}
