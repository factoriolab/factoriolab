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
  @Input() options: string[];
  @Input() selectType = IdType.Item;
  @Input() displayRate: DisplayRate;
  @Input() includeEmptyModule: boolean;

  @Output() selectId = new EventEmitter<string>();

  IdType = IdType;
  ItemId = ItemId;

  get width(): number {
    let buttons = this.options.length;
    if (this.includeEmptyModule) {
      buttons++;
    }
    const iconsPerRow = buttons <= 4 ? buttons : Math.ceil(Math.sqrt(buttons));
    return iconsPerRow * 2.375;
  }

  constructor() {
    super();
  }

  clickId(id: string): void {
    this.selectId.emit(id);
    this.open = false;
  }
}
