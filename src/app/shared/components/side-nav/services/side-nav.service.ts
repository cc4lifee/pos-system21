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
    this.breakpointObserver.observe('(max-width: 768px)').pipe(map((result) => result.matches)),
    {
      initialValue: false,
    },
  );

  private readonly _isMinimized = signal(false);
  private readonly _isDrawerOpen = signal(true);

  readonly isMinimized = this._isMinimized.asReadonly();
  readonly isDrawerOpen = this._isDrawerOpen.asReadonly();

  readonly drawerMode = computed<'side' | 'over'>(() => (this.isMobile() ? 'over' : 'side'));

  readonly showLabels = computed(() => (this.isMobile() ? true : !this.isMinimized()));

  constructor() {
    effect(() => {
      if (this.isMobile()) {
        this._isDrawerOpen.set(false);
      } else {
        this._isDrawerOpen.set(true);
      }
    });
  }

  toggleMinimized(): void {
    this._isMinimized.update((v) => !v);
  }

  toggleDrawer(): void {
    this._isDrawerOpen.update((v) => !v);
  }

  closeDrawer(): void {
    this._isDrawerOpen.set(false);
  }

  openDrawer(): void {
    this._isDrawerOpen.set(true);
  }
}
