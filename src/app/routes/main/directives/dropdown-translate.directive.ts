import { Directive, OnInit, Self, TemplateRef } from '@angular/core';
import { Dropdown } from 'primeng/dropdown';
import { combineLatest, filter, first } from 'rxjs';

import { ContentService } from '~/services';

@Directive({
  selector: '[labDropdownTranslate]',
})
export class DropdownTranslateDirective implements OnInit {
  constructor(
    @Self() private readonly pDropdown: Dropdown,
    private contentSvc: ContentService
  ) {}

  ngOnInit(): void {
    this.pDropdown.appendTo = 'body';
    combineLatest([
      this.contentSvc.translateSelectedItem$.pipe(
        filter((t): t is TemplateRef<any> => t != null)
      ),
      this.contentSvc.translateItem$.pipe(
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
