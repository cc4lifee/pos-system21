import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideNavPane } from './shared/components/side-nav/components/side-nav-pane/side-nav-pane';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('pos-system21');
}
