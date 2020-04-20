import {
  Component,
  HostListener,
  ElementRef,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'lab-settings-container',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss']
})
export class SettingsContainerComponent {
  @Output() cancel = new EventEmitter();

  constructor(private element: ElementRef) {}

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (!this.element.nativeElement.contains(event.target)) {
      this.cancel.emit();
    }
  }
}
