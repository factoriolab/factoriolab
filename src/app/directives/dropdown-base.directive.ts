import { Directive, inject, Input, OnChanges, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Dropdown } from 'primeng/dropdown';

import { ContentService } from '~/services';

@UntilDestroy()
@Directive({
  selector: '[labDropdownBase]',
})
export class DropdownBaseDirective implements OnInit, OnChanges {
  contentSvc = inject(ContentService);
  pDropdown = inject(Dropdown, { self: true });

  @Input() labDropdownBase: 'icon' | '' | undefined;

  ngOnInit(): void {
    this.pDropdown.appendTo = 'body';
    this.pDropdown.filter = true;
    this.pDropdown.scrollHeight = '40vh';
    this.pDropdown.panelStyleClass = 'tooltip';
    if (this.labDropdownBase) {
      this.pDropdown.styleClass = this.labDropdownBase;
    }

    this.contentSvc.isMobile$
      .pipe(untilDestroyed(this))
      .subscribe((isMobile) => (this.pDropdown.autofocusFilter = !isMobile));
  }

  ngOnChanges(): void {
    if (this.labDropdownBase) {
      this.pDropdown.styleClass = this.labDropdownBase;
    } else {
      this.pDropdown.styleClass = '';
    }
  }
}
