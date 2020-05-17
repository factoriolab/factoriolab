import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Id } from '~/models';

@Component({
  selector: 'lab-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Output() toggleSettings = new EventEmitter();

  Id = Id;

  constructor() {}
}
