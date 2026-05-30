import { Component } from '@angular/core';
import { SideNavPane } from '../../../shared/components/side-nav/components/side-nav-pane/side-nav-pane';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  imports: [SideNavPane, RouterOutlet],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {

}
