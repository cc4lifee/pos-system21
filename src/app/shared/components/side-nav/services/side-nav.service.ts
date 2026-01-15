import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SideNavService {
  
  private readonly minimizedVal = signal(false);
  private readonly openedVal = signal(true); // control general de apertura (desktop)
  // En móvil controlaremos openedVal según breakpoint

  readonly minimized = computed(() => this.minimizedVal());
  readonly opened = computed(() => this.openedVal());

  toggleMinimized(): void {
    this.minimizedVal.update(v => !v);
  }

  setOpened(open: boolean): void {
    this.openedVal.set(open);
  }
}

