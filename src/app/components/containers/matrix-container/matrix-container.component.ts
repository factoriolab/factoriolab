import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Dataset, MatrixResult } from '~/models';
import { State } from '~/store';
import { getMatrixResult } from '~/store/products';
import { getAdjustedDataset } from '~/store/recipes';

@Component({
  selector: 'lab-matrix-container',
  templateUrl: './matrix-container.component.html',
  styleUrls: ['./matrix-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixContainerComponent implements OnInit {
  data$: Observable<Dataset>;
  result$: Observable<MatrixResult>;

  constructor(public store: Store<State>) {}

  ngOnInit(): void {
    this.data$ = this.store.select(getAdjustedDataset);
    this.result$ = this.store.select(getMatrixResult);
  }
}
