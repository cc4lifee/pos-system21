import { computed, Injectable, signal, inject, effect } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SideNavService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 768px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  private readonly _desktopOpen = signal(true);
  private readonly _mobileOpen = signal(false);
  private readonly _isMinimized = signal(false);

  readonly desktopOpen = this._desktopOpen.asReadonly();
  readonly mobileOpen = this._mobileOpen.asReadonly();
  readonly isMinimized = this._isMinimized.asReadonly();

  readonly showLabels = computed(() => {
    // 📱 En mobile SIEMPRE mostramos labels
    if (this.isMobile()) return true;

    // 💻 En desktop depende de minimized
    return !this._isMinimized();
  });

  constructor() {
    effect(() => {
      if (this.isMobile()) {
        this._isMinimized.set(false);
      }
    });
  }

  toggleDesktopMinimize() {
    this._isMinimized.update((v) => !v);
  }

  toggleMobileDrawer() {
    this._mobileOpen.update((v) => !v);
  }

  closeMobile() {
    this._mobileOpen.set(false);
  }
}
