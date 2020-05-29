import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { Id } from '~/models';
import { DatasetState } from '~/store/dataset';

@Component({
  selector: 'lab-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() data: DatasetState;
  @Output() toggleSettings = new EventEmitter();

  Id = Id;

  constructor() {}
}
