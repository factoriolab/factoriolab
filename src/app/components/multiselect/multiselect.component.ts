import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Entities, ModData } from '~/models';

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
  @Input() options: ModData[];

  @Output() cancel = new EventEmitter();
  @Output() enableMod = new EventEmitter<string>();
  @Output() disableMod = new EventEmitter<string>();

  opening = true;
  modEnabled: Entities<boolean> = {};

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
      this.disableMod.emit(id);
    } else {
      this.enableMod.emit(id);
    }
    event.stopPropagation();
  }
}
