import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

import { IdType, DisplayRate, Dataset, ItemId } from '~/models';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent extends DialogContainerComponent {
  @Input() data: Dataset;
  @Input() selected: string;
  _options: string[];
  get options(): string[] {
    return this._options;
  }
  @Input() set options(value: string[]) {
    this._options = value;
    this.updateRows();
  }
  @Input() selectType = IdType.Item;
  @Input() displayRate: DisplayRate;
  _includeEmptyModule: boolean;
  get includeEmptyModule(): boolean {
    return this._includeEmptyModule;
  }
  @Input() set includeEmptyModule(value: boolean) {
    this._includeEmptyModule = value;
    this.updateRows();
  }

  @Output() selectId = new EventEmitter<string>();

  rows: string[][];

  IdType = IdType;
  ItemId = ItemId;

  get width(): number {
    if (this.rows.length > 1) {
      return Math.max(...this.rows.map((r) => r.length)) * 2.375;
    } else {
      const buttons = this.rows[0].length;
      const iconsPerRow =
        buttons <= 4 ? buttons : Math.ceil(Math.sqrt(buttons));
      return iconsPerRow * 2.375;
    }
  }

  constructor() {
    super();
  }

  updateRows(): void {
    if (this.includeEmptyModule) {
      this.rows = this.moduleRows(this.options);
    } else {
      this.rows = [this.options];
    }
  }

  clickId(id: string): void {
    this.selectId.emit(id);
    this.open = false;
  }
}
