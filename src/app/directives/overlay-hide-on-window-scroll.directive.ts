import { DOCUMENT } from '@angular/common';
import { Directive, Inject, OnDestroy, OnInit, Self } from '@angular/core';
import { Dropdown } from 'primeng/dropdown';

@Directive({
  selector: '[labOverlayHideOnWindowScroll]',
})
export class OverlayHideOnWindowScrollDirective implements OnInit, OnDestroy {
  listener = (): void => this.pDropdown.hide();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Self() private readonly pDropdown: Dropdown
  ) {}

  ngOnInit(): void {
    this.document.addEventListener('scroll', this.listener);
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('scroll', this.listener);
  }
}
