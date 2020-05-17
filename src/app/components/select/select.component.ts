import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';

import { OptionsType, IdType, options, DisplayRate } from '~/models';
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
  @Input() optionsType: OptionsType;
  @Input() selectType = IdType.Item;
  @Input() displayRate: DisplayRate;

  @Output() cancel = new EventEmitter();
  @Output() selectId = new EventEmitter<string>();

  options = options;

  IdType = IdType;

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
