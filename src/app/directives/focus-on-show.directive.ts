import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[labFocus]',
})
export class FocusOnShowDirective implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const input: HTMLInputElement = this.el.nativeElement as HTMLInputElement;
    input.focus();
    input.select();
  }
}
