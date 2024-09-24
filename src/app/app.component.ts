import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from 'src/environments';

import { ContentComponent } from './components/content/content.component';
import { AnalyticsService } from './services/analytics.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'lab-root',
  standalone: true,
  imports: [RouterOutlet, ContentComponent],
  template: `
    <router-outlet></router-outlet>
    <lab-content></lab-content>
  `,
})
export class AppComponent {
  analyticsSvc = inject(AnalyticsService);
  themeSvc = inject(ThemeService);

  constructor() {
    this.analyticsSvc.event('version', environment.version);
  }
}
