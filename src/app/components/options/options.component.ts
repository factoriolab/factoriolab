import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { IdName, NONE } from '~/models';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsComponent<T> extends DialogContainerComponent {
  @Input() title: string;
  @Input() selected: T;
  @Input() options: IdName<T>[];

  @Output() selectId = new EventEmitter<T>();

  get text(): string {
    return this.options.find((o) => o.id === this.selected)?.name || NONE;
  }

  constructor() {
    super();
  }
}
