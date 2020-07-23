import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Dataset } from '~/models';

@Component({
  selector: 'lab-ranker',
  templateUrl: './ranker.component.html',
  styleUrls: ['./ranker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankerComponent {
  @Input() data: Dataset;
  @Input() rank: string[];
  @Input() options: string[];

  @Output() cancel = new EventEmitter();
  @Output() preferItem = new EventEmitter<string>();
  @Output() dropItem = new EventEmitter<string>();

  opening = true;

  constructor(private element: ElementRef) {}

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (this.opening) {
      this.opening = false;
    } else if (!this.element.nativeElement.contains(event.target)) {
      this.cancel.emit();
    }
  }

  clickPrefer(id: string, event: MouseEvent) {
    this.preferItem.emit(id);
    event.stopPropagation();
  }

  clickDrop(id: string, event: MouseEvent) {
    this.dropItem.emit(id);
    event.stopPropagation();
  }
}
