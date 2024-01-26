import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';

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

    this.store
      .select(Settings.getCosts)
      .pipe(untilDestroyed(this))
      .subscribe(this.initEdit.bind(this));
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
