import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { Game, gameInfo, gameOptions } from '~/models';
import { RouterService } from '~/services';
import { LabState, Preferences, Producers, Products, Settings } from '~/store';
import { BrowserUtility } from '~/utilities';

@Component({
  selector: 'lab-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  vm$ = combineLatest([
    this.store.select(Settings.getSettings),
    this.store.select(Settings.getModOptions),
    this.store.select(Settings.getDataset),
    this.store.select(Preferences.preferencesState),
    this.store.select(Preferences.getSavedStates),
  ]).pipe(
    map(([settings, modOptions, data, preferences, savedStates]) => ({
      settings,
      modOptions,
      data,
      preferences,
      savedStates,
    }))
  );

  gameInfo = gameInfo;
  gameOptions = gameOptions;

  Game = Game;
  BrowserUtility = BrowserUtility;

  constructor(
    private router: Router,
    private store: Store<LabState>,
    private routerSvc: RouterService
  ) {}

  selectProduct(value: string): void {
    this.addProduct(value);
    this.router.navigate(['list']);
  }

  selectProducer(value: string): void {
    this.addProducer(value);
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

  navigate(url: string): void {
    this.router.navigateByUrl(url);
  }

  /** Action Dispatch Methods */
  setMod(value: string): void {
    this.store.dispatch(new Settings.SetModAction(value));
  }

  addProduct(value: string): void {
    this.store.dispatch(new Products.AddAction(value));
  }

  addProducer(value: string): void {
    this.store.dispatch(new Producers.AddAction(value));
  }
}
