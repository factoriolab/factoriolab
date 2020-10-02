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

import { Dataset } from '~/models';

@Component({
  selector: 'lab-ranker',
  templateUrl: './ranker.component.html',
  styleUrls: ['./ranker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankerComponent {
  @Input() data: Dataset;
  @Input() set rank(value: string[]) {
    this.editValue = [...value];
  }
  @Input() options: string[];
  @Input() parent: HTMLElement;

  @Output() commit = new EventEmitter<string[]>();

  opening = true;
  editValue: string[];

  @HostBinding('style.top.px') get top() {
    return this.parent ? this.parent.getBoundingClientRect().y - 4 : -4;
  }

  @HostBinding('style.left.px') get left() {
    return this.parent ? this.parent.getBoundingClientRect().x - 14 : -4;
  }

  @HostBinding('style.width.rem') get width() {
    return Math.ceil(Math.sqrt(this.options.length)) * 2.25 + 1.25;
  }

  constructor(private element: ElementRef) {}

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (this.opening) {
      this.opening = false;
    } else if (!this.element.nativeElement.contains(event.target)) {
      this.commit.emit(this.editValue);
    }
  }

  clickPrefer(id: string, event: MouseEvent) {
    this.editValue.push(id);
    event.stopPropagation();
  }

  clickDrop(id: string, event: MouseEvent) {
    this.editValue = this.editValue.filter((i) => i !== id);
    event.stopPropagation();
  }
}
