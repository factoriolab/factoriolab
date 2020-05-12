import {
  Component,
  ElementRef,
  HostListener,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { CategoryId, ItemId } from '~/models';
import { DatasetState } from '~/store/dataset';

@Component({
  selector: 'lab-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
})
export class PickerComponent {
  @Input() data: DatasetState;
  @Input() categoryId: CategoryId;
  @Input() itemId: ItemId;

  @Output() cancel = new EventEmitter();
  @Output() selectTab = new EventEmitter<CategoryId>();
  @Output() selectItem = new EventEmitter<ItemId>();

  opening = true;

  constructor(private element: ElementRef) {}

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (this.opening) {
      this.opening = false;
    } else if (!this.element.nativeElement.contains(event.target)) {
      this.cancel.emit();
    }
  }

  clickItem(id: ItemId) {
    this.selectItem.emit(id);
    this.cancel.emit();
  }
}
