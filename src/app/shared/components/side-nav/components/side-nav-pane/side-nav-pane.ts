import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../../auth/services/auth.service';
import { SideNavService } from '../../services/side-nav.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDrawerContent, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

// import { FullNamePipe } from '../../../pipes/full-name/full-name.pipe';
import { RouterModule } from '@angular/router';
import { SideNavMenuItems } from '../side-nav-menu-items/side-nav-menu-items';

@Component({
  selector: 'app-side-nav-pane',
  imports: [
    MatSidenavModule,
    MatButtonModule,
    MatListModule,
    SideNavMenuItems,
    // FullNamePipe,
    RouterModule,
  ],
  templateUrl: './side-nav-pane.html',
  styleUrl: './side-nav-pane.scss',
})
export class SideNavPane {
  protected readonly authService = inject(AuthService);
  protected readonly sideNavService = inject(SideNavService);
  private readonly bp = inject(BreakpointObserver);

  private readonly sub$ = new Subscription();

  // Perfil (imagen fallback)
  protected readonly showProfileImage = signal(true);

  // Responsive: modo del sidenav
  protected readonly isMobile = signal(false);
  readonly sidenavMode = computed<'side' | 'over'>(() => (this.isMobile() ? 'over' : 'side'));

  // Estado visual: ancho
  // readonly width = computed(() => (this.sideNavService.minimized() ? '5rem' : '17rem'));

  @ViewChild(MatDrawerContent) content!: MatDrawerContent;


  ngOnInit(): void {
    console.log('onInit');
    // Detectar breakpoint
    const bpSub = this.bp.observe('(max-width: 768px)').subscribe((res) => {
      const mobile = res.matches;
      this.isMobile.set(mobile);
      // En móvil, cerramos el sidenav inicialmente
      this.sideNavService.setOpened(!mobile);
    });

    this.sub$.add(bpSub);
  }

  ngOnDestroy(): void {
    this.sub$.unsubscribe();
  }

  toggleMinimized(): void {
    this.sideNavService.toggleMinimized();
    this.content.getElementRef().nativeElement.style.marginLeft = this.sideNavService.minimized() ? '5rem' : '17rem';

  }

  toggleOpened(): void {
    this.sideNavService.setOpened(!this.sideNavService.opened());
  }
}

