import {
  Component,
  ElementRef,
  HostListener,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

import { DatasetState } from '~/store/dataset';

@Component({
  selector: 'lab-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickerComponent {
  @Input() data: DatasetState;
  @Input() categoryId: string;
  @Input() itemId: string;

  @Output() cancel = new EventEmitter();
  @Output() selectTab = new EventEmitter<string>();
  @Output() selectItem = new EventEmitter<string>();

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

  clickItem(id: string) {
    this.selectItem.emit(id);
    this.cancel.emit();
  }
}
