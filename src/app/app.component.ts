import { Component, OnInit } from '@angular/core';
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
  constructor(
    private gaSvc: GoogleAnalyticsService,
    private store: Store<LabState>,
    private translateSvc: TranslateService,
    private routerSvc: RouterService,
    private themeSvc: ThemeService,
  ) {}

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
      BrowserUtility.modState = modId;
    });

    this.store.select(Preferences.preferencesState).subscribe((s) => {
      BrowserUtility.preferencesState = s;
    });
  }
}
