import { Directive, effect, inject, input, OnInit } from '@angular/core';
import { Dropdown } from 'primeng/dropdown';

import { ContentService } from '~/services';

@Directive({
  selector: '[labDropdownBase]',
})
export class DropdownBaseDirective implements OnInit {
  contentSvc = inject(ContentService);
  pDropdown = inject(Dropdown, { self: true });

  labDropdownBase = input<'icon' | ''>();
  setAutoFocusFilter = effect(() => {
    const isMobile = this.contentSvc.isMobile();
    this.pDropdown.autofocusFilter = !isMobile;
  });
  setStyleClass = effect(() => {
    const styleClass = this.labDropdownBase();
    this.pDropdown.styleClass = styleClass ?? undefined;
  });

  ngOnInit(): void {
    this.pDropdown.appendTo = 'body';
    this.pDropdown.filter = true;
    this.pDropdown.scrollHeight = '40vh';
    this.pDropdown.panelStyleClass = 'tooltip';
  }
}
