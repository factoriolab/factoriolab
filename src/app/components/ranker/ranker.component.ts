import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core';

import { Dataset, DefaultTogglePayload } from '~/models';

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
  @Input() default: string[];
  @Input() parent: HTMLElement;

  @Output() cancel = new EventEmitter();
  @Output() preferItem = new EventEmitter<DefaultTogglePayload>();
  @Output() dropItem = new EventEmitter<DefaultTogglePayload>();

  opening = true;

  @HostBinding('style.top.px') get top() {
    return this.parent ? this.parent.getBoundingClientRect().y - 4 : -4;
  }

  @HostBinding('style.left.px') get left() {
    return this.parent ? this.parent.getBoundingClientRect().x - 14 : -4;
  }

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
    this.preferItem.emit({ id, default: this.default });
    event.stopPropagation();
  }

  clickDrop(id: string, event: MouseEvent) {
    this.dropItem.emit({ id, default: this.default });
    event.stopPropagation();
  }
}
