import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
} from '@angular/core';

import { DatasetState } from '~/store/dataset';

export enum SelectType {
  Item,
  Recipe,
}

@Component({
  selector: 'lab-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent {
  @Input() data: DatasetState;
  @Input() options: string[][];
  @Input() selectedId: string;
  @Input() selectType: SelectType;

  @Output() cancel = new EventEmitter();
  @Output() selectId = new EventEmitter<string>();

  type = SelectType;

  constructor(private element: ElementRef) {}

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (!this.element.nativeElement.contains(event.target)) {
      this.cancel.emit();
    }
  }

  clickId(id: string) {
    if (id !== this.selectedId) {
      this.selectId.emit(id);
    } else {
      this.cancel.emit();
    }
  }
}
