import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from 'src/environments';

import { ContentComponent } from './components/content/content.component';
import { AnalyticsService } from './services/analytics.service';
import { PreferencesService } from './services/preferences.service';
import { SettingsService } from './services/settings.service';
import { ThemeService } from './services/theme.service';
import { TranslateService } from './services/translate.service';

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
  preferencesSvc = inject(PreferencesService);
  settingsSvc = inject(SettingsService);
  themeSvc = inject(ThemeService);
  translateSvc = inject(TranslateService);

  constructor() {
    this.analyticsSvc.event('version', environment.version);

    effect(() => {
      const mod = this.settingsSvc.mod();
      if (mod) this.analyticsSvc.event('set_game', mod.game);
    });

    effect(() => {
      const modId = this.settingsSvc.modId();
      if (modId) this.analyticsSvc.event('set_mod_id', modId);
    });
  }
}
