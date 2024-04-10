import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { tap, withLatestFrom } from 'rxjs';

import {
  CostKey,
  CostSettings,
  DialogComponent,
  Rational,
  rational,
} from '~/models';
import { ContentService } from '~/services';
import { LabState, Settings } from '~/store';

@Component({
  selector: 'lab-costs',
  templateUrl: './costs.component.html',
  styleUrls: ['./costs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostsComponent extends DialogComponent implements OnInit {
  store = inject(Store<LabState>);
  contentSvc = inject(ContentService);

  editValue = { ...Settings.initialSettingsState.costs };

  rational = rational;

  get modified(): boolean {
    return (Object.keys(this.editValue) as CostKey[]).some(
      (k) => this.editValue[k] !== Settings.initialSettingsState.costs[k],
    );
  }

  show$ = this.contentSvc.showCosts$.pipe(
    takeUntilDestroyed(),
    withLatestFrom(this.store.select(Settings.getCosts)),
    tap(([_, c]) => {
      this.initEdit(c);
      this.show();
    }),
  );

  Rational = Rational;

  ngOnInit(): void {
    this.show$.subscribe();
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
