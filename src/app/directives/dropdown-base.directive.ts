import { Directive, Input, OnChanges, OnInit, Self } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Dropdown } from 'primeng/dropdown';

import { ContentService } from '~/services';

@UntilDestroy()
@Directive({
  selector: '[labDropdownBase]',
})
export class DropdownBaseDirective implements OnInit, OnChanges {
  @Input() labDropdownBase: 'icon' | '' | undefined;

  constructor(
    private contentSvc: ContentService,
    @Self() private readonly pDropdown: Dropdown,
  ) {}

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
