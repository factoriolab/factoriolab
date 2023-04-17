import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { LabState, Recipes } from '~/store';

@Component({
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataComponent {
  vm$ = combineLatest([this.store.select(Recipes.getAdjustedDataset)]).pipe(
    map(([data]) => ({ data }))
  );

  constructor(private store: Store<LabState>) {}
}
