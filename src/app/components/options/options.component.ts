import { KeyValue } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { Entities } from '~/models';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'lab-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsComponent extends DialogComponent {
  @Input() title: string;
  @Input() selected: number;
  @Input() options: Entities;

  @Output() selectId = new EventEmitter<number>();

  constructor(element: ElementRef) {
    super(element);
  }

  cast(kv: KeyValue<string, string>): KeyValue<number, string> {
    return { key: Number(kv.key), value: kv.value };
  }
}
