import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { AppSharedModule } from '~/app-shared.module';
import { ItemsObj, LabState, Settings } from '~/store';

@Component({
  standalone: true,
  imports: [CommonModule, AppSharedModule],
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixComponent {
  vm$ = combineLatest([
    this.store.select(ItemsObj.getMatrixResult),
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
  setCostFactor(value: string): void {
    this.store.dispatch(new Settings.SetCostFactorAction(value));
  }

  setCostMachine(value: string): void {
    this.store.dispatch(new Settings.SetCostMachineAction(value));
  }

  setCostUnproduceable(value: string): void {
    this.store.dispatch(new Settings.SetCostUnproduceableAction(value));
  }

  setCostExcluded(value: string): void {
    this.store.dispatch(new Settings.SetCostExcludedAction(value));
  }

  setCostSurplus(value: string): void {
    this.store.dispatch(new Settings.SetCostSurplusAction(value));
  }

  setCostMaximize(value: string): void {
    this.store.dispatch(new Settings.SetCostMaximizeAction(value));
  }

  resetCost(): void {
    this.store.dispatch(new Settings.ResetCostAction());
  }
}
