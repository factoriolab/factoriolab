import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
} from '@angular/core';

import { OptionsType, options } from '~/models';
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
  @Input() selectedId: string;
  @Input() optionsType: OptionsType;
  @Input() selectType = SelectType.Item;

  @Output() cancel = new EventEmitter();
  @Output() selectId = new EventEmitter<string>();

  options = options;

  SelectType = SelectType;

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

  clickId(id: string, event: MouseEvent) {
    if (id !== this.selectedId) {
      this.selectId.emit(id);
    }
    this.cancel.emit();
    event.stopPropagation();
  }
}
