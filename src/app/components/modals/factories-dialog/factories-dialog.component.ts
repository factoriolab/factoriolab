import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { Game } from '~/models';
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
    this.store.select(Settings.getModuleOptions),
    this.store.select(Settings.getDataset),
  ]).pipe(
    map(([factories, factoryRows, factoryOptions, moduleOptions, data]) => ({
      factories,
      factoryRows,
      factoryOptions,
      moduleOptions,
      data,
    }))
  );

  visible = false;

  Game = Game;

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
}
