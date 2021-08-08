import {
  Component,
  HostListener,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'lab-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent {
  @Input() text: string;
  @Input() tooltip: string;

  hover = false;

  constructor() {}

  @HostListener('mouseenter') mouseenter(): void {
    this.hover = true;
  }
  @HostListener('mouseleave') mouseleave(): void {
    this.hover = false;
  }
}
