import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'lab-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() toggleSettings = new EventEmitter();

  constructor() {}

  settingsClicked(event: MouseEvent) {
    this.toggleSettings.emit();
    event.stopPropagation();
  }
}
