import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { filter, first, switchMap } from 'rxjs';

import { ContentComponent } from './components/content/content.component';
import { versionStr } from './helpers';
import { TranslatePipe } from './pipes/translate.pipe';
import { AnalyticsService } from './services/analytics.service';
import { ContentService } from './services/content.service';
import { DataService } from './services/data.service';
import { ThemeService } from './services/theme.service';
import { TranslateService } from './services/translate.service';
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
  router = inject(Router);
  swUpdate = inject(SwUpdate);
  analyticsSvc = inject(AnalyticsService);
  contentSvc = inject(ContentService);
  dataSvc = inject(DataService);
  settingsSvc = inject(SettingsService);
  themeSvc = inject(ThemeService);
  translateSvc = inject(TranslateService);

  versionUpdateVisible = false;

  constructor() {
    this.dataSvc.config$.pipe(first()).subscribe((c) => {
      console.log(versionStr(c.version));
      if (c.version) this.analyticsSvc.event('version', c.version);
    });

    this.swUpdate.unrecoverable
      .pipe(
        switchMap(() =>
          this.translateSvc
            .multi(['app.updateRequired', 'app.updateRequiredMessage', 'ok'])
            .pipe(first()),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(([header, message, acceptLabel]) => {
        this.contentSvc.confirm({
          icon: 'fa-solid fa-arrows-rotate',
          header,
          message,
          acceptLabel,
          rejectVisible: false,
          accept: () => {
            this.contentSvc.reload();
          },
          reject: () => {
            this.contentSvc.reload();
          },
        });
      });

    this.swUpdate.versionUpdates
      .pipe(
        filter((event) => event.type === 'VERSION_READY'),
        switchMap(() =>
          this.translateSvc
            .multi([
              'app.updateAvailable',
              'app.updateAvailableMessage',
              'yes',
              'cancel',
            ])
            .pipe(first()),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(([header, message, acceptLabel, rejectLabel]) => {
        this.contentSvc.confirm({
          icon: 'fa-solid fa-arrows-rotate',
          header,
          message,
          acceptLabel,
          rejectLabel,
          rejectButtonStyleClass: 'p-button-outlined',
          accept: () => {
            this.contentSvc.reload();
          },
        });
      });
  }

  async reset(): Promise<void> {
    this.dataSvc.error$.next(undefined);
    await this.router.navigate(['/']);
    this.contentSvc.reload();
  }
}
