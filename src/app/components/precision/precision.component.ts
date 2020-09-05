import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Dataset } from '~/models';

@Component({
  selector: 'lab-precision',
  templateUrl: './precision.component.html',
  styleUrls: ['./precision.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrecisionComponent {
  @Input() data: Dataset;
  @Input() iconId: string;
  @Input() tooltip: string;
  @Input() value: number;
  @Input() default: number;

  @Output() setValue = new EventEmitter<number>();

  constructor() {}

  emitEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target?.value) {
      this.setValue.emit(Number(target.value));
    }
  }
}
