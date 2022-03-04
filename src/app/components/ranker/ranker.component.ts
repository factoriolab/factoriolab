import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Dataset, DisplayRate, ItemId } from '~/models';
import { TrackService } from '~/services';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-ranker',
  templateUrl: './ranker.component.html',
  styleUrls: ['./ranker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankerComponent extends DialogContainerComponent {
  @Input() data: Dataset;
  @Input() selected: string[];
  @Input() set options(value: string[]) {
    this.rows = this.moduleRows(value);
  }
  @Input() displayRate: DisplayRate;

  @Output() selectIds = new EventEmitter<string[]>();

  edited = false;
  editValue: string[];
  rows: string[][];

  ItemId = ItemId;

  get width(): number {
    const w = Math.max(...this.rows.map((r) => r.length)) * 2.375;
    if (this.rows.length > 5) {
      return w + 1.125; // Add in padding for scrollbar
    } else {
      return w;
    }
  }

  constructor(public track: TrackService) {
    super();
  }

  text(id: string): string {
    if (this.editValue.length > 0 && this.editValue.indexOf(id) !== -1) {
      return (this.editValue.indexOf(id) + 1).toString();
    }
    return null;
  }

  canAdd(id: string): boolean {
    if (!this.edited || id === ItemId.Module) {
      return true;
    }

    if (this.editValue.indexOf(id) !== -1) {
      return false;
    }

    const lim = this.data.itemEntities[id].module.limitation;
    return (
      !lim ||
      !this.editValue.some(
        (i) => this.data.itemEntities[i].module.limitation === lim
      )
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

  clickId(id: string): void {
    if (id === ItemId.Module) {
      if (this.edited) {
        this.selectIds.emit(this.editValue);
      } else {
        this.selectIds.emit([]);
      }
      this.cancel();
    } else if (this.canAdd(id)) {
      if (this.edited) {
        this.editValue.push(id);
      } else {
        this.edited = true;
        this.editValue = [id];
      }
      if (!this.data.itemEntities[id].module.limitation) {
        this.selectIds.emit(this.editValue);
        this.cancel();
      }
    }
  }
}
