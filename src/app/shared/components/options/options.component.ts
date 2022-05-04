import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import { IdName, NONE } from '~/models';
import { TrackService } from '~/services';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsComponent<T extends boolean | number | string>
  extends DialogContainerComponent
  implements OnChanges
{
  @Input() title: string | undefined;
  @Input() selected: T | undefined;
  @Input() options: IdName<T>[] = [];

  @Output() selectId = new EventEmitter<T>();

  text = '';

  constructor(public trackSvc: TrackService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] || changes['selected']) {
      this.text =
        this.options.find((o) => o.id === this.selected)?.name || NONE;
    }
  }
}
