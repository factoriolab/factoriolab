import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { tap, withLatestFrom } from 'rxjs';

import { CostKey, CostSettings, Rational, rational } from '~/models';
import { TranslatePipe } from '~/pipes';
import { ContentService } from '~/services';
import { Settings } from '~/store';
import { InputNumberComponent } from '../input-number/input-number.component';
import { DialogComponent } from '../modal';

@Component({
  selector: 'lab-costs',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    TooltipModule,
    InputNumberComponent,
    TranslatePipe,
  ],
  templateUrl: './costs.component.html',
  styleUrls: ['./costs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostsComponent extends DialogComponent implements OnInit {
  store = inject(Store);
  contentSvc = inject(ContentService);

  editValue = { ...Settings.initialState.costs };

  rational = rational;

  get modified(): boolean {
    return (Object.keys(this.editValue) as CostKey[]).some(
      (k) => this.editValue[k] !== Settings.initialState.costs[k],
    );
  }

  show$ = this.contentSvc.showCosts$.pipe(
    takeUntilDestroyed(),
    withLatestFrom(this.store.select(Settings.selectCosts)),
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
    this.editValue = { ...Settings.initialState.costs };
  }

  save(): void {
    const costs = this.editValue;
    this.store.dispatch(Settings.setCosts({ costs }));
  }
}
