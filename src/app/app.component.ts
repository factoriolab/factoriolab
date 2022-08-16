import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { MenuItem } from 'primeng/api';
import { combineLatest, first, map } from 'rxjs';

import { environment } from 'src/environments';
import {
  APP,
  Game,
  gameInfo,
  ItemId,
  MatrixResultType,
  SimplexType,
} from './models';
import {
  ContentService,
  ErrorService,
  RouterService,
  StateService,
} from './services';
import { LabState, Preferences, Products, Settings } from './store';
import { ResetAction } from './store/app.actions';

const LAB_ICON_STYLE_ID = 'lab-icon-css';

@Component({
  selector: 'lab-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  vm$ = combineLatest([
    this.store.select(Settings.getGame),
    this.store.select(Settings.getMod),
    this.store.select(Products.getProducts),
    this.store.select(Products.getMatrixResult),
    this.errorSvc.message$,
  ]).pipe(
    map(([game, mod, products, result, errorMsg]) => ({
      game,
      mod,
      products,
      result,
      errorMsg,
    }))
  );

  showSimplexErr = false;
  fixLoading = false;
  simplexErrSub = this.store
    .select(Products.getMatrixResult)
    .subscribe(
      (result) =>
        (this.showSimplexErr = result.resultType === MatrixResultType.Failed)
    );
  settingsActive = false;
  version = `${APP} ${environment.version}`;
  tabItems: MenuItem[] = [
    { label: 'app.list', icon: 'fa-solid fa-list', routerLink: 'list' },
    {
      label: 'app.flow',
      icon: 'fa-solid fa-diagram-project',
      routerLink: 'flow',
    },
    {
      label: 'app.matrix',
      icon: 'fa-solid fa-table-cells',
      routerLink: 'matrix',
    },
  ];

  ItemId = ItemId;
  MatrixResultType = MatrixResultType;
  Game = Game;

  constructor(
    public contentSvc: ContentService,
    @Inject(DOCUMENT) private document: Document,
    private meta: Meta,
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
      style.innerText = css;
      head.appendChild(style);
    });
  }

  toggleMenu(): void {
    this.settingsActive = !this.settingsActive;
  }

  tryFixSimplex(): void {
    this.fixLoading = true;
    setTimeout(() => {
      this.store
        .select(Settings.getDefaults)
        .pipe(first())
        .subscribe((def) => {
          this.store.dispatch(
            new Preferences.SetSimplexTypeAction(SimplexType.WasmFloat64)
          );
          this.store.dispatch(
            new Settings.SetDisabledRecipesAction({
              value: [],
              def: def?.disabledRecipeIds,
            })
          );
        });
      this.showSimplexErr = false;
      this.fixLoading = false;
    }, 10);
  }

  reset(game: Game): void {
    this.errorSvc.message$.next(null);
    this.router.navigateByUrl(gameInfo[game].route);
    this.store.dispatch(new ResetAction());
  }
}
