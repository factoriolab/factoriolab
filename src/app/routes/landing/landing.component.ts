import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';

import { AppSharedModule } from '~/app-shared.module';
import {
  Game,
  gameInfo,
  gameOptions,
  ObjectiveBase,
  ObjectiveUnit,
} from '~/models';
import { ContentService, RouterService } from '~/services';
import { LabState, Objectives, Preferences, Recipes, Settings } from '~/store';
import { BrowserUtility } from '~/utilities';

@Component({
  standalone: true,
  imports: [CommonModule, AppSharedModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  router = inject(Router);
  contentSvc = inject(ContentService);
  store = inject(Store<LabState>);
  routerSvc = inject(RouterService);

  vm$ = combineLatest({
    itemIds: this.store.select(Recipes.getAvailableItems),
    settings: this.store.select(Settings.getSettings),
    modOptions: this.store.select(Settings.getModOptions),
    data: this.store.select(Settings.getDataset),
    mod: this.store.select(Settings.getMod),
    recipeIds: this.store.select(Settings.getAvailableRecipes),
    savedStates: this.store.select(Settings.getSavedStates),
    preferences: this.store.select(Preferences.preferencesState),
    isMobile: this.contentSvc.isMobile$,
  });

  gameInfo = gameInfo;
  gameOptions = gameOptions;

  Game = Game;
  BrowserUtility = BrowserUtility;

  selectItem(value: string): void {
    this.addItemObjective(value);
    this.router.navigate(['list']);
  }

  selectRecipe(value: string): void {
    this.addRecipeObjective(value);
    this.router.navigate(['list']);
  }

  setState(query: string): void {
    if (query) {
      const queryParams = this.routerSvc.getParams(query);
      this.router.navigate(['list'], { queryParams });
    }
  }

  setGame(game: Game): void {
    this.setMod(gameInfo[game].modId);
  }

  addItemObjective(targetId: string): void {
    this.addObjective({ targetId, unit: ObjectiveUnit.Items });
  }

  addRecipeObjective(targetId: string): void {
    this.addObjective({ targetId, unit: ObjectiveUnit.Machines });
  }

  /** Action Dispatch Methods */
  setMod(value: string): void {
    this.store.dispatch(new Settings.SetModAction(value));
  }

  addObjective(value: ObjectiveBase): void {
    this.store.dispatch(new Objectives.AddAction(value));
  }

  setBypassLanding(value: boolean): void {
    this.store.dispatch(new Preferences.SetBypassLandingAction(value));
  }
}
