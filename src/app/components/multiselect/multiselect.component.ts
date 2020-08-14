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

import { Entities, DefaultTogglePayload, ModInfo } from '~/models';

@Component({
  selector: 'lab-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectComponent {
  @Input() set enabledIds(value: string[]) {
    this.modEnabled = value.reduce(
      (e: Entities<boolean>, m) => ({ ...e, ...{ [m]: true } }),
      {}
    );
  }
  @Input() options: ModInfo[];
  @Input() default: string[];
  @Input() parent: HTMLElement;

  @Output() cancel = new EventEmitter();
  @Output() enableMod = new EventEmitter<DefaultTogglePayload>();
  @Output() disableMod = new EventEmitter<DefaultTogglePayload>();

  opening = true;
  modEnabled: Entities<boolean> = {};

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
    if (this.modEnabled[id]) {
      this.disableMod.emit({ id, default: this.default });
    } else {
      this.enableMod.emit({ id, default: this.default });
    }
    event.stopPropagation();
  }
}
