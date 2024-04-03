import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import { CostKey, CostSettings, rational } from '~/models';
import { ContentService } from '~/services';
import { LabState, Settings } from '~/store';

@Component({
  selector: 'lab-costs',
  templateUrl: './costs.component.html',
  styleUrls: ['./costs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostsComponent {
  ref = inject(ChangeDetectorRef);
  store = inject(Store<LabState>);
  contentSvc = inject(ContentService);

  visible = false;
  editValue = { ...Settings.initialSettingsState.costs };

  rational = rational;

  get modified(): boolean {
    return (Object.keys(this.editValue) as CostKey[]).some(
      (k) => this.editValue[k] !== Settings.initialSettingsState.costs[k],
    );
  }

  constructor() {
    this.contentSvc.showCosts$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.visible = true;
      this.ref.markForCheck();
    });

    this.store
      .select(Settings.getCosts)
      .pipe(takeUntilDestroyed())
      .subscribe((c) => this.initEdit(c));
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
