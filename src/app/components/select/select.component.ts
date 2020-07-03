import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core';

import { IdType, DisplayRate, ItemId } from '~/models';
import { DatasetState } from '~/store/dataset';

@Component({
  selector: 'lab-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent {
  @Input() data: DatasetState;
  @Input() selectedId: string;
  @Input() options: string[];
  @Input() selectType = IdType.Item;
  @Input() displayRate: DisplayRate;
  @Input() includeEmptyModule: boolean;

  @Output() cancel = new EventEmitter();
  @Output() selectId = new EventEmitter<string>();

  IdType = IdType;
  ItemId = ItemId;

  opening = true;

  constructor(private element: ElementRef) {}

  @HostBinding('style.width.rem')
  get width() {
    return this.options.length < 4 ? 9.625 : 7.375;
  }

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (this.opening) {
      this.opening = false;
    } else if (!this.element.nativeElement.contains(event.target)) {
      this.cancel.emit();
    }
  }

  clickId(id: string, event: MouseEvent) {
    this.selectId.emit(id);
    this.cancel.emit();
    event.stopPropagation();
  }

  clickCancel(event: MouseEvent) {
    this.cancel.emit();
    event.stopPropagation();
  }
}
