import { Component, Input } from '@angular/core';

@Component({
  selector: 'lab-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {
  @Input() iconId: string;
  @Input() title: string;
  @Input() scale: boolean;

  constructor() {}
}
