import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Store } from '@ngrx/store';

import { Dataset, DefaultIdPayload, MatrixResult } from '~/models';
import { TrackService } from '~/services';
import { LabState } from '~/store';
import { getRecipesModified, RecipesState } from '~/store/recipes';
import { getSettingsModified } from '~/store/settings';

@Component({
  selector: 'lab-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixComponent {
  recipesModified$ = this.store.select(getRecipesModified);
  settingsModified$ = this.store.select(getSettingsModified);

  @Input() data: Dataset;
  @Input() result: MatrixResult;
  @Input() costFactor: string;
  @Input() costFactory: string;
  @Input() costInput: string;
  @Input() costIgnored: string;
  @Input() recipeRaw: RecipesState;

  @Output() setCostFactor = new EventEmitter<string>();
  @Output() setCostFactory = new EventEmitter<string>();
  @Output() setCostInput = new EventEmitter<string>();
  @Output() setCostIgnored = new EventEmitter<string>();
  @Output() setRecipeCost = new EventEmitter<DefaultIdPayload>();
  @Output() resetCost = new EventEmitter();
  @Output() resetRecipeCost = new EventEmitter();

  constructor(public track: TrackService, private store: Store<LabState>) {}
}
