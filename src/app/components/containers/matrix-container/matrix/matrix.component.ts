import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { Dataset, DefaultIdPayload, MatrixResult } from '~/models';
import { RecipesState } from '~/store/recipes';

@Component({
  selector: 'lab-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixComponent {
  @Input() data: Dataset;
  @Input() result: MatrixResult;
  @Input() costFactor: string;
  @Input() costFactory: string;
  @Input() costInput: string;
  @Input() costIgnored: string;
  @Input() recipeRaw: RecipesState;
  @Input() modifiedCost: boolean;
  @Input() modifiedRecipeCost: boolean;

  @Output() setCostFactor = new EventEmitter<string>();
  @Output() setCostFactory = new EventEmitter<string>();
  @Output() setCostInput = new EventEmitter<string>();
  @Output() setCostIgnored = new EventEmitter<string>();
  @Output() setRecipeCost = new EventEmitter<DefaultIdPayload>();
  @Output() resetCost = new EventEmitter();
  @Output() resetRecipeCost = new EventEmitter();

  constructor() {}

  trackRowBy(i: number, v: any): string {
    return this.result?.recipes?.[i - 1] || i.toString();
  }

  trackColBy(i: number, v: any): string {
    return i.toString();
  }
}
