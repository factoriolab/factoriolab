import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[labNoDrag]',
  standalone: true,
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
