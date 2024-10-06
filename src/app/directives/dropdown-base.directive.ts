import { Directive, effect, inject, input, OnInit } from '@angular/core';
import { Dropdown } from 'primeng/dropdown';

import { ContentService } from '~/services/content.service';

@Directive({
  selector: '[labDropdownBase]',
  standalone: true,
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
    this.pDropdown.styleClass = this.labDropdownBase();
  });

  ngOnInit(): void {
    this.pDropdown.appendTo = 'body';
    this.pDropdown.filter = true;
    this.pDropdown.scrollHeight = '40vh';
    this.pDropdown.panelStyleClass = 'tooltip';
  }
}
