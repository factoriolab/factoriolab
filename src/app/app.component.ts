import { AsyncPipe } from '@angular/common';
import { Component, inject, NgZone } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { first } from 'rxjs';

import { ContentComponent } from './components/content/content.component';
import { versionStr } from './helpers';
import { TranslatePipe } from './pipes/translate.pipe';
import { AnalyticsService } from './services/analytics.service';
import { ContentService } from './services/content.service';
import { DataService } from './services/data.service';
import { ThemeService } from './services/theme.service';
import { SettingsService } from './store/settings.service';

@Component({
  selector: 'lab-root',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterOutlet,
    ButtonModule,
    DialogModule,
    ContentComponent,
    TranslatePipe,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  ngZone = inject(NgZone);
  router = inject(Router);
  analyticsSvc = inject(AnalyticsService);
  contentSvc = inject(ContentService);
  dataSvc = inject(DataService);
  settingsSvc = inject(SettingsService);
  themeSvc = inject(ThemeService);

  constructor() {
    this.dataSvc.config$.pipe(first()).subscribe((c) => {
      console.log(versionStr(c.version));
      if (c.version) this.analyticsSvc.event('version', c.version);
    });
  }

  reset(): void {
    this.dataSvc.error$.next(undefined);
    void this.router.navigate(['/']);
    this.reload();
  }

  // istanbul ignore next: Helper to call browser location function
  reload(): void {
    setTimeout(() => {
      location.reload();
    });
  }
}
