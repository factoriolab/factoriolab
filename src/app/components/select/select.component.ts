import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';

import { IdType, DisplayRate, Dataset, ItemId } from '~/models';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'lab-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent extends DialogComponent {
  @Input() data: Dataset;
  @Input() selected: string;
  @Input() options: string[];
  @Input() selectType = IdType.Item;
  @Input() displayRate: DisplayRate;
  @Input() includeEmptyModule: boolean;
  @Input() parent: HTMLElement;

  @Output() selectId = new EventEmitter<string>();

  IdType = IdType;
  ItemId = ItemId;

  get top(): number {
    return this.parent ? this.parent.getBoundingClientRect().y - 13 : -13;
  }

  get left(): number {
    return this.parent ? this.parent.getBoundingClientRect().x - 13 : -13;
  }

  get width(): number {
    const buttons = this.options.length + 1;
    const iconsPerRow = buttons <= 4 ? buttons : Math.ceil(Math.sqrt(buttons));
    return iconsPerRow * 2.375 + 1.5;
  }

  constructor(element: ElementRef) {
    super(element);
  }

  clickId(id: string, event: MouseEvent): void {
    this.selectId.emit(id);
    this.open = false;
    event.stopPropagation();
  }
}
