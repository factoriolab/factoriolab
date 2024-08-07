import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs';

import { environment } from 'src/environments';
import { Preferences, Settings } from '~/store';
import { ContentComponent } from './components/content/content.component';
import {
  AnalyticsService,
  RouterService,
  ThemeService,
  TranslateService,
} from './services';
import { BrowserUtility } from './utilities';

@Component({
  selector: 'lab-root',
  standalone: true,
  imports: [RouterOutlet, ContentComponent],
  template: `
    <router-outlet></router-outlet>
    <lab-content></lab-content>
  `,
})
export class AppComponent implements OnInit {
  analyticsSvc = inject(AnalyticsService);
  store = inject(Store);
  translateSvc = inject(TranslateService);
  routerSvc = inject(RouterService);
  themeSvc = inject(ThemeService);

  ngOnInit(): void {
    this.themeSvc.initialize();
    this.routerSvc.initialize();

    this.analyticsSvc.event('version', environment.version);

    this.store
      .select(Settings.selectGame)
      .pipe(
        tap((game) => {
          this.analyticsSvc.event('set_game', game);
        }),
      )
      .subscribe();

    this.store
      .select(Preferences.selectLanguage)
      .pipe(
        tap((lang) => {
          this.translateSvc.use(lang);
          this.analyticsSvc.event('set_lang', lang);
        }),
      )
      .subscribe();

    this.store
      .select(Settings.selectModId)
      .pipe(
        tap((modId) => {
          this.analyticsSvc.event('set_mod_id', modId);
        }),
      )
      .subscribe();

    this.store
      .select(Preferences.preferencesState)
      .pipe(
        tap((s) => {
          BrowserUtility.preferencesState = s;
        }),
      )
      .subscribe();
  }
}
