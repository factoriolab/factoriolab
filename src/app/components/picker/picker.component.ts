import {
  Component,
  ElementRef,
  HostListener,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { Category, Item } from '~/models';

@Component({
  selector: 'lab-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss']
})
export class PickerComponent {
  @Input() categories: Category[];
  @Input() categoryId: string;
  @Input() itemRows: string[][];
  @Input() itemEntities: { [id: string]: Item };
  @Input() itemId: string;

  @Output() cancel = new EventEmitter();
  @Output() selectTab = new EventEmitter<string>();
  @Output() selectItem = new EventEmitter<string>();

  constructor(private element: ElementRef) {}

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (!this.element.nativeElement.contains(event.target)) {
      this.cancel.emit();
    }
  }

  clickItem(id: string) {
    if (id !== this.itemId) {
      this.selectItem.emit(id);
    } else {
      this.cancel.emit();
    }
  }
}
