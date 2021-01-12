import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Dataset, ItemId } from '~/models';
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
  @Input() options: string[];

  @Output() selectIds = new EventEmitter<string[]>();

  edited = false;
  editValue: string[];

  ItemId = ItemId;

  get width(): number {
    const buttons = this.options.length + 1;
    const iconsPerRow = buttons <= 4 ? buttons : Math.ceil(Math.sqrt(buttons));
    return iconsPerRow * 2.375 + 1.5;
  }

  constructor() {
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
        this.selectIds.emit([id]);
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
