import { Directive, inject, OnInit } from '@angular/core';
import { Dropdown } from 'primeng/dropdown';
import { combineLatest, first } from 'rxjs';

import { filterNullish } from '~/helpers';
import { ContentService } from '~/services/content.service';

@Directive({
  selector: '[labDropdownTranslate]',
  standalone: true,
})
export class DropdownTranslateDirective implements OnInit {
  contentSvc = inject(ContentService);
  pDropdown = inject(Dropdown, { self: true });

  ngOnInit(): void {
    this.pDropdown.appendTo = 'body';
    combineLatest([
      this.contentSvc.translateSelectedItem$.pipe(filterNullish()),
      this.contentSvc.translateItem$.pipe(filterNullish()),
    ])
      .pipe(first())
      .subscribe(([selectedItemTemplate, itemTemplate]) => {
        this.pDropdown.selectedItemTemplate = selectedItemTemplate;
        this.pDropdown.itemTemplate = itemTemplate;
      });
  }
}
