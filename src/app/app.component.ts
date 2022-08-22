import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  NgZone,
  OnInit,
} from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { combineLatest, map } from 'rxjs';

import { Game, gameInfo, ItemId } from './models';
import {
  ContentService,
  ErrorService,
  RouterService,
  StateService,
} from './services';
import { App, LabState, Preferences, Settings } from './store';

const LAB_ICON_STYLE_ID = 'lab-icon-css';

@Component({
  selector: 'lab-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  vm$ = combineLatest([
    this.store.select(Settings.getGame),
    this.contentSvc.scrollTop$,
    this.contentSvc.routerLoading$,
    this.errorSvc.message$,
  ]).pipe(
    map(([game, scrollTop, routerLoading, errorMsg]) => ({
      game,
      scrollTop,
      routerLoading,
      errorMsg,
    }))
  );

  isResetting = false;

  ItemId = ItemId;
  Game = Game;

  constructor(
    public contentSvc: ContentService,
    @Inject(DOCUMENT) private document: Document,
    private meta: Meta,
    private ngZone: NgZone,
    private ref: ChangeDetectorRef,
    private router: Router,
    private gaSvc: GoogleAnalyticsService,
    private store: Store<LabState>,
    private translateSvc: TranslateService,
    private errorSvc: ErrorService,
    private routerSvc: RouterService,
    private stateSvc: StateService
  ) {}

  ngOnInit(): void {
    this.translateSvc.setDefaultLang('en');
    this.routerSvc.initialize();
    this.stateSvc.initialize();

    this.store.select(Settings.getGame).subscribe((game) => {
      this.gaSvc.event('set_game', game);
      this.meta.updateTag({
        name: 'description',
        content: `A feature-rich production calculator for ${gameInfo[game].meta} and similar games.
Determine resource and factory requirements for your desired output products.`,
      });
    });

    this.store.select(Preferences.getLanguage).subscribe((lang) => {
      this.translateSvc.use(lang);
      this.gaSvc.event('set_lang', lang);
    });

    this.store.select(Settings.getModId).subscribe((modId) => {
      this.gaSvc.event('set_mod_id', modId);
    });

    this.store.select(Settings.getDataset).subscribe((data) => {
      // Generate .lab-icon::before css rules stylesheet
      const head = this.document.getElementsByTagName('head')[0];
      const old = this.document.getElementById(LAB_ICON_STYLE_ID);
      if (old) {
        head.removeChild(old);
      }
      const style = this.document.createElement('style');
      style.id = LAB_ICON_STYLE_ID;
      let css = '';
      data.iconIds.forEach((i) => {
        const icon = data.iconEntities[i];
        css += `.${i}::before { background-image: url("${icon.file}"); background-position: ${icon.position}; } `;
      });
      data.itemIds
        .filter((i) => data.itemEntities[i].icon)
        .forEach((i) => {
          const icon = data.iconEntities[data.itemEntities[i].icon!];
          css += `.${i}.item::before { background-image: url("${icon.file}"); background-position: ${icon.position}; } `;
        });
      data.recipeIds
        .filter((i) => data.recipeEntities[i].icon)
        .forEach((i) => {
          const icon = data.iconEntities[data.recipeEntities[i].icon!];
          css += `.${i}.recipe::before { background-image: url("${icon.file}"); background-position: ${icon.position}; } `;
        });
      style.innerText = css;
      head.appendChild(style);
    });
  }

  /**
   * This doesn't seem like it should be necessary,
   * but error message sometimes does not render without it
   * */
  ngAfterViewInit(): void {
    this.errorSvc.message$.subscribe(() => this.ref.detectChanges());
  }

  reset(game: Game): void {
    this.isResetting = true;
    setTimeout(() => {
      this.ngZone.run(() => {
        this.errorSvc.message$.next(null);
        this.router.navigateByUrl(gameInfo[game].route);
        this.store.dispatch(new App.ResetAction());
        this.isResetting = false;
      });
    });
  }
}
