import { KeyValue } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { Entities } from '~/models';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsComponent extends DialogContainerComponent {
  @Input() title: string;
  @Input() selected: number;
  @Input() options: Entities;

  @Output() selectId = new EventEmitter<number>();

  constructor() {
    super();
  }

  cast(kv: KeyValue<string, string>): KeyValue<number, string> {
    return { key: Number(kv.key), value: kv.value };
  }
}
