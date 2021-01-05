import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';

import { IdName } from '~/models';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'lab-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectComponent extends DialogComponent {
  @Input() header: string;
  @Input() selected: string[];
  @Input() options: IdName[];
  @Input() parent: HTMLElement;

  @Output() selectIds = new EventEmitter<string[]>();

  edited = false;
  editValue: string[];

  get top(): number {
    return this.parent?.getBoundingClientRect().y + 1;
  }

  get left(): number {
    return this.parent?.getBoundingClientRect().x + 1;
  }

  constructor(element: ElementRef) {
    super(element);
  }

  clickOpen(): void {
    this.open = true;
    this.editValue = [...this.selected];
  }

  close(): void {
    if (this.edited) {
      this.selectIds.emit(this.editValue);
    }
    this.open = false;
  }

  cancel(event: Event): void {
    this.open = false;
    event.stopPropagation();
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
