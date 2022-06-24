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

import { Dataset, Game, ItemId } from '~/models';
import { LabState } from '~/store';
import * as Recipes from '~/store/recipes';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-ranker',
  templateUrl: './ranker.component.html',
  styleUrls: ['./ranker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankerComponent
  extends DialogContainerComponent
  implements OnChanges
{
  @Input() selected: string[] = [];
  @Input() options: string[] = [];

  @Output() selectIds = new EventEmitter<string[]>();

  vm$ = this.store
    .select(Recipes.getAdjustedDataset)
    .pipe(map((data) => ({ data })));

  edited = false;
  editValue: string[] = [];
  rows: string[][] = [[]];
  width = 0;

  ItemId = ItemId;
  Game = Game;

  constructor(private store: Store<LabState>) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.rows = this.moduleRows(this.options);
      const w = Math.max(...this.rows.map((r) => r.length)) * 2.375;
      if (this.rows.length > 5) {
        this.width = w + 1.125; // Add in padding for scrollbar
      } else {
        this.width = w;
      }
    }
  }

  text(id: string): string | null {
    if (this.editValue.length > 0 && this.editValue.indexOf(id) !== -1) {
      return (this.editValue.indexOf(id) + 1).toString();
    }
    return null;
  }

  canAdd(id: string, data: Dataset): boolean {
    if (!this.edited || id === ItemId.Module) {
      return true;
    }

    if (this.editValue.indexOf(id) !== -1) {
      return false;
    }

    const lim = data.moduleEntities[id].limitation;
    return (
      !lim ||
      !this.editValue.some((i) => data.moduleEntities[i].limitation === lim)
    );
  }

  clickOpen(): void {
    this.open = true;
    this.edited = false;
    this.editValue = [...this.selected];
  }

  close(): void {
    if (this.edited) {
      this.selectIds.emit(this.editValue);
    }
    this.open = false;
  }

  clickId(id: string, data: Dataset): void {
    if (id === ItemId.Module) {
      if (this.edited) {
        this.selectIds.emit(this.editValue);
      } else {
        this.selectIds.emit([]);
      }
      this.cancel();
    } else if (this.canAdd(id, data)) {
      if (this.edited) {
        this.editValue.push(id);
      } else {
        this.edited = true;
        this.editValue = [id];
      }
      if (!data.moduleEntities[id].limitation) {
        this.selectIds.emit(this.editValue);
        this.cancel();
      }
    }
  }
}
