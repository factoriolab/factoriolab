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
export class OptionsComponent extends DialogContainerComponent {
  @Input() title: string;
  @Input() selected: string | number | boolean;
  @Input() options: IdName[];

  @Output() selectId = new EventEmitter<string | number | boolean>();

  get text(): string {
    return this.options.find((o) => o.id === this.selected)?.name || NONE;
  }

  constructor() {
    super();
  }
}
