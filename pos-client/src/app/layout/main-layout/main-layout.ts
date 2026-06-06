import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideNavPane } from '../../shared/components/side-nav/components/side-nav-pane/side-nav-pane';

@Component({
  selector: 'app-main-layout',
  imports: [SideNavPane, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
