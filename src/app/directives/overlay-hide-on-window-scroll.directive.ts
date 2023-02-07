import { DOCUMENT } from '@angular/common';
import { Directive, Inject, OnInit, Optional, Self } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Dropdown } from 'primeng/dropdown';
import { Menu } from 'primeng/menu';
import { MultiSelect } from 'primeng/multiselect';

@UntilDestroy()
@Directive({
  selector: '[labOverlayHideOnWindowScroll]',
})
export class OverlayHideOnWindowScrollDirective implements OnInit {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Optional() @Self() private readonly pDropdown?: Dropdown,
    @Optional() @Self() private readonly pMenu?: Menu,
    @Optional() @Self() private readonly pMultiSelect?: MultiSelect
  ) {}

  ngOnInit(): void {
    this.dropdownSetup(this.pDropdown);
    this.menuSetup(this.pMenu);
    this.multiselectSetup(this.pMultiSelect);
  }

  dropdownSetup(dropdown?: Dropdown): void {
    if (dropdown == null) return;

    const listener = (): void => dropdown.hide();

    dropdown.onShow.pipe(untilDestroyed(this)).subscribe(() => {
      this.document.addEventListener('scroll', listener);
    });

    dropdown.onHide.pipe(untilDestroyed(this)).subscribe(() => {
      this.document.removeEventListener('scroll', listener);
    });
  }

  menuSetup(menu?: Menu): void {
    if (menu == null) return;

    const listener = (): void => menu.hide();

    menu.onShow.pipe(untilDestroyed(this)).subscribe(() => {
      this.document.addEventListener('scroll', listener);
    });

    menu.onHide.pipe(untilDestroyed(this)).subscribe(() => {
      this.document.removeEventListener('scroll', listener);
    });
  }

  multiselectSetup(multiSelect?: MultiSelect): void {
    if (multiSelect == null) return;

    const listener = (): void => multiSelect.hide();

    multiSelect.onPanelShow.pipe(untilDestroyed(this)).subscribe(() => {
      this.document.addEventListener('scroll', listener);
    });

    multiSelect.onPanelHide.pipe(untilDestroyed(this)).subscribe(() => {
      this.document.removeEventListener('scroll', listener);
    });
  }
}
