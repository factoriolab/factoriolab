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
  @Input() selected: string | number;
  @Input() options: Entities;

  @Output() selectOption = new EventEmitter<string | number>();

  constructor(element: ElementRef) {
    super(element);
  }
}
