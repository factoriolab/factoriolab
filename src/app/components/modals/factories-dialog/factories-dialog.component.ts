import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { Game, ItemId } from '~/models';
import { DialogService } from '~/services';
import { Factories, LabState, Settings } from '~/store';

@UntilDestroy()
@Component({
  selector: 'lab-factories-dialog',
  templateUrl: './factories-dialog.component.html',
  styleUrls: ['./factories-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FactoriesDialogComponent implements OnInit {
  vm$ = combineLatest([
    this.store.select(Factories.getFactories),
    this.store.select(Factories.getFactoryRows),
    this.store.select(Factories.getFactoryOptions),
    this.store.select(Settings.getDataset),
  ]).pipe(
    map(([factories, factoryRows, factoryOptions, data]) => ({
      factories,
      factoryRows,
      factoryOptions,
      data,
    }))
  );

  visible = false;

  Game = Game;
  ItemId = ItemId;

  constructor(
    private ref: ChangeDetectorRef,
    private store: Store<LabState>,
    private dialogSvc: DialogService
  ) {}

  ngOnInit(): void {
    this.dialogSvc.showFactories$.pipe(untilDestroyed(this)).subscribe(() => {
      this.visible = true;
      this.ref.markForCheck();
    });
  }

  setFactory(id: string, value: string, def: string[] | undefined): void {
    this.store.dispatch(new Factories.SetFactoryAction({ id, value, def }));
  }

  setModuleRank(id: string, value: string[], def: string[] | undefined): void {
    this.store.dispatch(new Factories.SetModuleRankAction({ id, value, def }));
  }

  setOverclock(id: string, value: number, def: number | undefined): void {
    this.store.dispatch(new Factories.SetOverclockAction({ id, value, def }));
  }

  setBeaconCount(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Factories.SetBeaconCountAction({ id, value, def }));
  }

  setBeacon(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Factories.SetBeaconAction({ id, value, def }));
  }

  setBeaconModule(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(
      new Factories.SetBeaconModuleAction({ id, value, def })
    );
  }

  removeFactory(value: string, def: string[] | undefined): void {
    this.store.dispatch(new Factories.RemoveAction({ value, def }));
  }

  raiseFactory(value: string, def: string[] | undefined): void {
    this.store.dispatch(new Factories.RaiseAction({ value, def }));
  }

  addFactory(value: string, def: string[] | undefined): void {
    this.store.dispatch(new Factories.AddAction({ value, def }));
  }
}
