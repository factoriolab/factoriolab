import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit,
} from '@angular/core';
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
import { ThemeService } from './services/theme.service';
import { App, LabState, Preferences, Products, Settings } from './store';

@Component({
  selector: 'lab-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  vm$ = combineLatest([
    this.store.select(Settings.getGame),
    this.store.select(Settings.getMod),
    this.store.select(Products.getMatrixResult),
    this.contentSvc.settingsActive$,
    this.contentSvc.scrollTop$,
    this.contentSvc.routerLoading$,
    this.errorSvc.message$,
  ]).pipe(
    map(
      ([
        game,
        mod,
        result,
        settingsActive,
        scrollTop,
        routerLoading,
        errorMsg,
      ]) => ({
        game,
        mod,
        result,
        settingsActive,
        scrollTop,
        routerLoading,
        errorMsg,
      })
    )
  );

  version = `${APP} ${environment.version}`;
  isResetting = false;
  showSimplexErr = false;
  isFixingSimplex = false;
  simplexErrSub = this.store
    .select(Products.getMatrixResult)
    .subscribe(
      (result) =>
        (this.showSimplexErr = result.resultType === MatrixResultType.Failed)
    );
  tabItems: MenuItem[] = [
    {
      label: 'app.list',
      icon: 'fa-solid fa-list',
      routerLink: 'list',
      queryParamsHandling: 'preserve',
    },
    {
      label: 'app.flow',
      icon: 'fa-solid fa-diagram-project',
      routerLink: 'flow',
      queryParamsHandling: 'preserve',
    },
    {
      label: 'app.matrix',
      icon: 'fa-solid fa-table-cells',
      routerLink: 'matrix',
      queryParamsHandling: 'preserve',
    },
  ];

  Game = Game;
  ItemId = ItemId;
  MatrixResultType = MatrixResultType;

  constructor(
    public contentSvc: ContentService,
    private meta: Meta,
    private ngZone: NgZone,
    private ref: ChangeDetectorRef,
    private router: Router,
    private gaSvc: GoogleAnalyticsService,
    private store: Store<LabState>,
    private translateSvc: TranslateService,
    private errorSvc: ErrorService,
    private routerSvc: RouterService,
    private stateSvc: StateService,
    private themeSvc: ThemeService
  ) {}

  ngOnInit(): void {
    this.translateSvc.setDefaultLang('en');
    this.routerSvc.initialize();
    this.stateSvc.initialize();
    this.themeSvc.initialize();

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
  }

  /**
   * This doesn't seem like it should be necessary,
   * but error message sometimes does not render without it
   * */
  ngAfterViewInit(): void {
    this.errorSvc.message$.subscribe(() => this.ref.detectChanges());
  }

  tryFixSimplex(): void {
    this.isFixingSimplex = true;
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
      this.isFixingSimplex = false;
    }, 10);
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
