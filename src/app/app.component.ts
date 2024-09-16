import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { environment } from 'src/environments';

import { ContentComponent } from './components/content/content.component';
import { AnalyticsService } from './services/analytics.service';
import { ThemeService } from './services/theme.service';
import { TranslateService } from './services/translate.service';
import {
  preferencesState,
  selectLanguage,
} from './store/preferences/preferences.selectors';
import { selectGame, selectModId } from './store/settings/settings.selectors';
import { BrowserUtility } from './utilities/browser.utility';

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
  store = inject(Store);
  analyticsSvc = inject(AnalyticsService);
  themeSvc = inject(ThemeService);
  translateSvc = inject(TranslateService);

  ngOnInit(): void {
    this.themeSvc.initialize();

    this.analyticsSvc.event('version', environment.version);

    this.store
      .select(selectGame)
      .pipe(
        tap((game) => {
          this.analyticsSvc.event('set_game', game);
        }),
      )
      .subscribe();

    this.store
      .select(selectLanguage)
      .pipe(
        tap((lang) => {
          this.translateSvc.use(lang);
          this.analyticsSvc.event('set_lang', lang);
        }),
      )
      .subscribe();

    this.store
      .select(selectModId)
      .pipe(
        tap((modId) => {
          this.analyticsSvc.event('set_mod_id', modId);
        }),
      )
      .subscribe();

    this.store
      .select(preferencesState)
      .pipe(tap((s) => (BrowserUtility.preferencesState = s)))
      .subscribe();
  }
}
