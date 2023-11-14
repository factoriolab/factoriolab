import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

import { environment } from 'src/environments';
import { LabState, Preferences, Settings } from '~/store';
import { RouterService, ThemeService } from './services';
import { BrowserUtility } from './utilities';

@Component({
  selector: 'lab-root',
  template: `
    <router-outlet></router-outlet>
    <lab-content></lab-content>
  `,
})
export class AppComponent implements OnInit {
  gaSvc = inject(GoogleAnalyticsService);
  store = inject(Store<LabState>);
  translateSvc = inject(TranslateService);
  routerSvc = inject(RouterService);
  themeSvc = inject(ThemeService);

  ngOnInit(): void {
    this.themeSvc.initialize();
    this.routerSvc.initialize();

    this.gaSvc.event('version', environment.version);

    this.store.select(Settings.getGame).subscribe((game) => {
      this.gaSvc.event('set_game', game);
    });

    this.store.select(Preferences.getLanguage).subscribe((lang) => {
      this.translateSvc.use(lang);
      this.gaSvc.event('set_lang', lang);
    });

    this.store.select(Settings.getModId).subscribe((modId) => {
      this.gaSvc.event('set_mod_id', modId);
    });

    this.store.select(Preferences.preferencesState).subscribe((s) => {
      BrowserUtility.preferencesState = s;
    });
  }
}
