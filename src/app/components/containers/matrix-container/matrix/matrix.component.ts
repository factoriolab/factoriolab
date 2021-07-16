import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Dataset, MatrixResult } from '~/models';

@Component({
  selector: 'lab-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixComponent {
  @Input() data: Dataset;
  @Input() result: MatrixResult;

  constructor() {}
}
