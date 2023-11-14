import { Directive, inject, OnInit, TemplateRef } from '@angular/core';
import { Dropdown } from 'primeng/dropdown';
import { combineLatest, filter, first } from 'rxjs';

import { ContentService } from '~/services';

@Directive({
  selector: '[labDropdownTranslate]',
})
export class DropdownTranslateDirective implements OnInit {
  contentSvc = inject(ContentService);
  pDropdown = inject(Dropdown, { self: true });

  ngOnInit(): void {
    this.pDropdown.appendTo = 'body';
    combineLatest([
      this.contentSvc.translateSelectedItem$.pipe(
        filter((t): t is TemplateRef<unknown> => t != null),
      ),
      this.contentSvc.translateItem$.pipe(
        filter((t): t is TemplateRef<unknown> => t != null),
      ),
    ])
      .pipe(first())
      .subscribe(([selectedItemTemplate, itemTemplate]) => {
        this.pDropdown.selectedItemTemplate = selectedItemTemplate;
        this.pDropdown.itemTemplate = itemTemplate;
      });
  }
}
