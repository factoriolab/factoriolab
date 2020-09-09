import { trigger, transition, style, animate } from '@angular/animations';
import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
  Input,
  HostListener,
  ElementRef,
} from '@angular/core';

import { Dataset, ItemId } from '~/models';

@Component({
  selector: 'lab-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ right: '-18rem', opacity: 0.1 }),
        animate('300ms ease', style({ right: '0', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ right: '0', opacity: 1 }),
        animate('300ms ease', style({ right: '-18rem', opacity: 0.1 })),
      ]),
    ]),
  ],
})
export class HeaderComponent {
  @Input() data: Dataset;
  @Output() toggleSettings = new EventEmitter();
  @Output() hideHeader = new EventEmitter();

  ItemId = ItemId;

  menuOpen = false;

  constructor(private element: ElementRef) {}

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (!this.element.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }
}
