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

import { Entities, IdName, toBoolEntities } from '~/models';

@Component({
  selector: 'lab-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectComponent {
  @Input() header: string;
  @Input() set enabledIds(value: string[]) {
    this.idEnabled = toBoolEntities(value);
  }
  @Input() options: IdName[];
  @Input() parent: HTMLElement;

  @Output() cancel = new EventEmitter();
  @Output() enableId = new EventEmitter<string>();
  @Output() disableId = new EventEmitter<string>();

  opening = true;
  idEnabled: Entities<boolean> = {};

  @HostBinding('style.top.px') get top() {
    return this.parent ? this.parent.getBoundingClientRect().y + 1 : 1;
  }

  @HostBinding('style.left.px') get left() {
    return this.parent ? this.parent.getBoundingClientRect().x - 8 : 1;
  }

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
    if (this.idEnabled[id]) {
      this.disableId.emit(id);
    } else {
      this.enableId.emit(id);
    }
    event.stopPropagation();
  }
}
