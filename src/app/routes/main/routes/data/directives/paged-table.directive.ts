import { Directive, inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';

@Directive({
  selector: '[labPagedTable]',
})
export class PagedTableDirective implements OnInit {
  translateSvc = inject(TranslateService);
  pTable = inject(Table, { self: true });

  ngOnInit(): void {
    this.pTable.styleClass = 'p-datatable-sm';
    this.pTable.rows = 10;
    this.pTable.rowsPerPageOptions = [10, 25, 50, 100, 250];
    this.pTable.showCurrentPageReport = true;
    this.pTable.currentPageReportTemplate = this.translateSvc.instant(
      'data.currentPageReportTemplate',
    );
  }
}
