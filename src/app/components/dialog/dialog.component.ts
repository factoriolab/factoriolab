import { Component, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'lab-dialog',
  template: '',
})
export class DialogComponent {
  open = false;

  constructor(protected element: ElementRef) {}

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent): void {
    if (!this.element.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }
}
