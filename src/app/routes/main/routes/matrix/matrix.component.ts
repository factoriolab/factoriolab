import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { AppSharedModule } from '~/app-shared.module';
import { ItemObjectives, LabState, Settings } from '~/store';

@Component({
  standalone: true,
  imports: [CommonModule, AppSharedModule],
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixComponent {
  vm$ = combineLatest([
    this.store.select(ItemObjectives.getMatrixResult),
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

  setCostUnproduceable(data: string): void {
    this.store.dispatch(new Settings.SetCostUnproduceableAction(data));
  }

  setCostExcluded(data: string): void {
    this.store.dispatch(new Settings.SetCostExcludedAction(data));
  }

  resetCost(): void {
    this.store.dispatch(new Settings.ResetCostAction());
  }
}
