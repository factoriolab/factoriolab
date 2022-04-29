import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { Game, IdType, ItemId } from '~/models';
import { LabState } from '~/store';
import * as Recipes from '~/store/recipes';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

const COL_WIDTH = 2.375;

@Component({
  selector: 'lab-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent
  extends DialogContainerComponent
  implements OnChanges
{
  @Input() selected: string | undefined;
  @Input() options: string[] = [];
  @Input() selectType = IdType.Item;
  @Input() includeEmptyModule = false;
  @Input() columns: number | null | undefined;

  @Output() selectId = new EventEmitter<string>();

  vm$ = this.store
    .select(Recipes.getAdjustedDataset)
    .pipe(map((data) => ({ data })));

  rows: string[][] = [[]];
  width = 0;

  IdType = IdType;
  ItemId = ItemId;
  Game = Game;

  constructor(private store: Store<LabState>) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] || changes['includeEmptyModule']) {
      if (this.includeEmptyModule) {
        this.rows = this.moduleRows(this.options);
      } else {
        this.rows = [this.options];
      }
    }

    if (this.columns != null) {
      this.width = this.columns * COL_WIDTH;
    } else if (this.rows.length > 1) {
      this.width = Math.max(...this.rows.map((r) => r.length)) * COL_WIDTH;
    } else {
      const buttons = this.rows[0].length;
      const iconsPerRow =
        buttons <= 4 ? buttons : Math.ceil(Math.sqrt(buttons));
      this.width = iconsPerRow * COL_WIDTH;
    }
  }

  clickId(id: string): void {
    this.selectId.emit(id);
    this.open = false;
  }
}
