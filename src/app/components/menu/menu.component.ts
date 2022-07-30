import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { combineLatest, first, map } from 'rxjs';

import { Game, gameInfo, gameOptions } from '~/models';
import { RouterService } from '~/services';
import { App, LabState, Preferences, Settings } from '~/store';
import { BrowserUtility } from '~/utilities';

@UntilDestroy()
@Component({
  selector: 'lab-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export class MenuComponent implements OnInit {
  @HostBinding('class.active') @Input() active = false;

  @Output() toggleMenu = new EventEmitter();

  vm$ = combineLatest([
    this.store.select(Settings.getSettings),
    this.store.select(Settings.getDataset),
    this.store.select(Settings.getModOptions),
    this.store.select(Settings.getDisabledRecipeOptions),
    this.store.select(Preferences.preferencesState),
    this.store.select(Preferences.getSavedStates),
  ]).pipe(
    map(
      ([
        settings,
        data,
        modOptions,
        disabledRecipeOptions,
        preferences,
        savedStates,
      ]) => ({
        settings,
        data,
        modOptions,
        disabledRecipeOptions,
        preferences,
        savedStates,
      })
    )
  );

  state = '';
  stateCtrl = new FormControl('', Validators.required);
  editState = false;

  gameOptions = gameOptions;

  Game = Game;

  constructor(
    private confirmationSvc: ConfirmationService,
    private router: Router,
    private store: Store<LabState>,
    private translateSvc: TranslateService,
    private routerSvc: RouterService
  ) {}

  ngOnInit(): void {
    this.store
      .select(Preferences.getStates)
      .pipe(first())
      .subscribe((states) => {
        this.state =
          Object.keys(states).find(
            (s) => states[s] === BrowserUtility.search
          ) || '';
      });
  }

  clickResetSettings(): void {
    this.confirmationSvc.confirm({
      icon: 'fa-solid fa-exclamation-triangle',
      header: this.translateSvc.instant('settings.reset'),
      message: this.translateSvc.instant('settings.resetWarning'),
      acceptLabel: this.translateSvc.instant('yes'),
      rejectLabel: this.translateSvc.instant('cancel'),
      accept: () => {
        localStorage.clear();
        this.resetSettings();
      },
    });
  }

  setState(id: string, preferences: Preferences.PreferencesState): void {
    const query = preferences.states[id];
    if (query) {
      const queryParams = this.routerSvc.getParams(query);
      this.state = id;
      this.router.navigate([], { queryParams });
    }
  }

  openEditState(): void {
    this.stateCtrl.setValue(this.state);
    this.stateCtrl.markAsPristine();
    this.editState = true;
  }

  setGame(game: Game): void {
    this.setMod(gameInfo[game].modId);
  }

  /** Action Dispatch Methods */
  resetSettings(): void {
    this.store.dispatch(new App.ResetAction());
  }

  setMod(value: string): void {
    this.store.dispatch(new Settings.SetModAction(value));
  }

  setDisabledRecipes(value: string[], def: string[] | undefined): void {
    this.store.dispatch(new Settings.SetDisabledRecipesAction({ value, def }));
  }
}
