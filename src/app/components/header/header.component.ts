import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { Dataset } from '~/models';

@Component({
  selector: 'lab-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() data: Dataset;
  @Output() toggleSettings = new EventEmitter();

  constructor() {}
}
