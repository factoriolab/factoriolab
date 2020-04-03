import { Component, EventEmitter, Output } from '@angular/core';

import { Id } from '~/models';

@Component({
  selector: 'lab-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() toggleSettings = new EventEmitter();

  Id = Id;

  constructor() {}

  settingsClicked(event: MouseEvent) {
    this.toggleSettings.emit();
    event.stopPropagation();
  }
}
