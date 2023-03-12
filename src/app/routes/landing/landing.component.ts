import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { AppSharedModule } from '~/app-shared.module';
import { Game, gameInfo, gameOptions } from '~/models';
import { RouterService } from '~/services';
import {
  ItemObjectives,
  LabState,
  Preferences,
  RecipeObjectives,
  Settings,
} from '~/store';
import { BrowserUtility } from '~/utilities';

@Component({
  standalone: true,
  imports: [CommonModule, AppSharedModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  vm$ = combineLatest([
    this.store.select(Settings.getSettings),
    this.store.select(Settings.getModOptions),
    this.store.select(Settings.getDataset),
    this.store.select(Settings.getMod),
    this.store.select(Preferences.preferencesState),
    this.store.select(Preferences.getSavedStates),
  ]).pipe(
    map(([settings, modOptions, data, mod, preferences, savedStates]) => ({
      settings,
      modOptions,
      data,
      mod,
      preferences,
      savedStates,
    }))
  );

  gameInfo = gameInfo;
  gameOptions = gameOptions;

  Game = Game;
  BrowserUtility = BrowserUtility;

  constructor(
    public router: Router,
    private store: Store<LabState>,
    private routerSvc: RouterService
  ) {}

  selectItem(value: string): void {
    this.addItemObjective(value);
    this.router.navigate(['list']);
  }

  selectRecipe(value: string): void {
    this.addRecipeObjective(value);
    this.router.navigate(['list']);
  }

  setState(id: string, preferences: Preferences.PreferencesState): void {
    const query = preferences.states[id];
    if (query) {
      const queryParams = this.routerSvc.getParams(query);
      this.router.navigate(['list'], { queryParams });
    }
  }

  setGame(game: Game): void {
    this.setMod(gameInfo[game].modId);
  }

  /** Action Dispatch Methods */
  setMod(value: string): void {
    this.store.dispatch(new Settings.SetModAction(value));
  }

  addItemObjective(value: string): void {
    this.store.dispatch(new ItemObjectives.AddAction(value));
  }

  addRecipeObjective(value: string): void {
    this.store.dispatch(new RecipeObjectives.AddAction(value));
  }

  setBypassLanding(value: boolean): void {
    this.store.dispatch(new Preferences.SetBypassLandingAction(value));
  }
}
