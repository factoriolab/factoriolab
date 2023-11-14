import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { combineLatest, tap } from 'rxjs';

import { CostKey, CostSettings } from '~/models';
import { ContentService } from '~/services';
import { LabState, Settings } from '~/store';

@UntilDestroy()
@Component({
  selector: 'lab-costs',
  templateUrl: './costs.component.html',
  styleUrls: ['./costs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostsComponent implements OnInit {
  ref = inject(ChangeDetectorRef);
  store = inject(Store<LabState>);
  contentSvc = inject(ContentService);

  vm$ = combineLatest({
    costs: this.store
      .select(Settings.getCosts)
      .pipe(tap((costs) => this.initEdit(costs))),
    settingsModified: this.store.select(Settings.getSettingsModified),
  });

  visible = false;
  editValue = { ...Settings.initialSettingsState.costs };

  get modified(): boolean {
    return (Object.keys(this.editValue) as CostKey[]).some(
      (k) => this.editValue[k] !== Settings.initialSettingsState.costs[k],
    );
  }

  ngOnInit(): void {
    this.contentSvc.showCosts$.pipe(untilDestroyed(this)).subscribe(() => {
      this.visible = true;
      this.ref.markForCheck();
    });
  }

  initEdit(costs: CostSettings): void {
    this.editValue = { ...costs };
  }

  reset(): void {
    this.editValue = { ...Settings.initialSettingsState.costs };
  }

  save(): void {
    this.store.dispatch(new Settings.SetCostsAction(this.editValue));
  }
}
