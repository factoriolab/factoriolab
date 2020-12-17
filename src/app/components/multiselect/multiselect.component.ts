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

import { Entities, IdName } from '~/models';

@Component({
  selector: 'lab-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectComponent {
  @Input() header: string;
  @Input() set enabledIds(value: string[]) {
    this.editValue = [...value];
  }
  @Input() options: IdName[];
  @Input() parent: HTMLElement;

  @Output() cancel = new EventEmitter();
  @Output() commit = new EventEmitter<string[]>();

  opening = true;
  edited = false;
  editValue: string[];
  idEnabled: Entities<boolean> = {};

  @HostBinding('style.top.px') get top() {
    return this.parent ? this.parent.getBoundingClientRect().y + 1 : 1;
  }

  @HostBinding('style.left.px') get left() {
    return this.parent ? this.parent.getBoundingClientRect().x + 1 : 1;
  }

  constructor(private element: ElementRef) {}

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (this.opening) {
      this.opening = false;
    } else if (!this.element.nativeElement.contains(event.target)) {
      if (this.edited) {
        this.commit.emit(this.editValue);
      } else {
        this.cancel.emit();
      }
    }
  }

  clickId(id: string, event: MouseEvent) {
    this.edited = true;
    if (this.editValue.indexOf(id) === -1) {
      this.editValue.push(id);
    } else {
      this.editValue = this.editValue.filter((i) => i !== id);
    }
    event.stopPropagation();
  }
}
