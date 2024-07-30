import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { environment } from 'src/environments';
import { LabState, Preferences, Settings } from '~/store';
import { AppSharedModule } from './app-shared.module';
import { RouterService, ThemeService, AnalyticsService } from './services';
import { BrowserUtility } from './utilities';

@Component({
  selector: 'lab-root',
  standalone: true,
  imports: [RouterOutlet, AppSharedModule],
  template: `
    <router-outlet></router-outlet>
    <lab-content></lab-content>
  `,
})
export class AppComponent implements OnInit {
  analyticsSvc = inject(AnalyticsService);
  store = inject(Store<LabState>);
  translateSvc = inject(TranslateService);
  routerSvc = inject(RouterService);
  themeSvc = inject(ThemeService);

  ngOnInit(): void {
    this.themeSvc.initialize();
    this.routerSvc.initialize();

    this.analyticsSvc.event('version', environment.version);

    this.store.select(Settings.getGame).subscribe((game) => {
      this.analyticsSvc.event('set_game', game);
    });

    this.store.select(Preferences.getLanguage).subscribe((lang) => {
      this.translateSvc.use(lang);
      this.analyticsSvc.event('set_lang', lang);
    });

    this.store.select(Settings.getModId).subscribe((modId) => {
      this.analyticsSvc.event('set_mod_id', modId);
    });

    this.store.select(Preferences.preferencesState).subscribe((s) => {
      BrowserUtility.preferencesState = s;
    });
  }
}
