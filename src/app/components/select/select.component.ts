import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
} from '@angular/core';

import { IdType, DisplayRate, Dataset, ItemId, Game } from '~/models';
import { TrackService } from '~/services';
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
  @Input() data: Dataset;
  @Input() selected: string;
  @Input() options: string[];
  @Input() selectType = IdType.Item;
  @Input() displayRate: DisplayRate;
  @Input() includeEmptyModule: boolean;
  @Input() columns: number | undefined;

  @Output() selectId = new EventEmitter<string>();

  rows: string[][];
  width = 0;

  IdType = IdType;
  ItemId = ItemId;
  Game = Game;

  constructor(public track: TrackService) {
    super();
  }

  ngOnChanges(): void {
    if (this.options) {
      if (this.includeEmptyModule) {
        this.rows = this.moduleRows(this.options);
      } else {
        this.rows = [this.options];
      }
    } else {
      this.rows = [[]];
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
