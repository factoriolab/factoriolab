import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { LabState, Products, Settings } from '~/store';

@Component({
  selector: 'lab-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixComponent {
  vm$ = combineLatest([
    this.store.select(Products.getMatrixResult),
    this.store.select(Settings.getSettingsModified),
    this.store.select(Settings.settingsState),
  ]).pipe(
    map(([result, settingsModified, settings]) => ({
      result,
      settingsModified,
      settings,
    }))
  );

  constructor(private store: Store<LabState>) {}

  /** Action Dispatch Methods */
  setCostFactor(data: string): void {
    this.store.dispatch(new Settings.SetCostFactorAction(data));
  }

  setCostMachine(data: string): void {
    this.store.dispatch(new Settings.SetCostMachineAction(data));
  }

  setCostInput(data: string): void {
    this.store.dispatch(new Settings.SetCostInputAction(data));
  }

  setCostIgnored(data: string): void {
    this.store.dispatch(new Settings.SetCostIgnoredAction(data));
  }

  resetCost(): void {
    this.store.dispatch(new Settings.ResetCostAction());
  }
}
