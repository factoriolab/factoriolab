import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'lab-dialog',
  template: '',
})
export class DialogComponent {
  open = false;

  @HostBinding('class.relative') relative = true;

  constructor(protected element: ElementRef) {}

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent): void {
    if (!this.element.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  close(): void {
    this.open = false;
  }
}
