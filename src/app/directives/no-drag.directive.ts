import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[labNoDrag]',
})
export class NoDragDirective {
  @HostListener('mousedown', ['$event']) onMousedown(event: MouseEvent): void {
    event.stopPropagation();
  }

  @HostListener('touchstart', ['$event']) onTouchStart(
    event: TouchEvent,
  ): void {
    event.stopPropagation();
  }
}
