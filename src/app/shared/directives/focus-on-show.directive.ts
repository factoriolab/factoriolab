import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[labFocus]',
})
export class FocusOnShowDirective implements OnInit {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    const input = this.el.nativeElement;
    input.focus();
    input.select();
  }
}
