import {
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Table } from 'primeng/table';

import { TranslateService } from '~/services/translate.service';

@Directive({
  selector: '[labPagedTable]',
  standalone: true,
})
export class PagedTableDirective implements OnInit {
  ref = inject(ChangeDetectorRef);
  destroyRef = inject(DestroyRef);
  translateSvc = inject(TranslateService);
  pTable = inject(Table, { self: true });

  ngOnInit(): void {
    this.pTable.styleClass = 'p-datatable-sm';
    this.pTable.rows = 10;
    this.pTable.rowsPerPageOptions = [10, 25, 50, 100, 250];
    this.pTable.showCurrentPageReport = true;
    this.translateSvc
      .get('data.currentPageReportTemplate')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((currentPageReportTemplate) => {
        this.pTable.currentPageReportTemplate = currentPageReportTemplate;
        this.ref.markForCheck();
      });
  }
}
