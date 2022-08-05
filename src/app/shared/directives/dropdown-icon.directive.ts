import { Directive, OnInit, Self, TemplateRef } from '@angular/core';
import { Dropdown } from 'primeng/dropdown';
import { combineLatest, filter, first } from 'rxjs';

import { ContentService } from '~/services';

@Directive({
  selector: '[labDropdownIcon]',
})
export class DropdownIconDirective implements OnInit {
  constructor(
    @Self() private readonly pDropdown: Dropdown,
    private contentSvc: ContentService
  ) {}

  ngOnInit(): void {
    this.pDropdown.appendTo = 'body';
    this.pDropdown.filter = true;
    this.pDropdown.scrollHeight = '400px';
    combineLatest([
      this.contentSvc.dropdownIconSelectedItem$.pipe(
        filter((t): t is TemplateRef<any> => t != null)
      ),
      this.contentSvc.dropdownIconItem$.pipe(
        filter((t): t is TemplateRef<any> => t != null)
      ),
    ])
      .pipe(first())
      .subscribe(([selectedItemTemplate, itemTemplate]) => {
        this.pDropdown.selectedItemTemplate = selectedItemTemplate;
        this.pDropdown.itemTemplate = itemTemplate;
      });
  }
}
