import { Directive, OnInit, Self } from '@angular/core';
import { Table } from 'primeng/table';

@Directive({
  selector: '[labPagedTable]',
})
export class PagedTableDirective implements OnInit {
  constructor(@Self() private readonly pTable: Table) {}

  ngOnInit(): void {
    this.pTable.styleClass = 'p-datatable-sm';
    this.pTable.paginator = true;
    this.pTable.rows = 10;
    this.pTable.rowsPerPageOptions = [10, 25, 50, 100, 250];
  }
}
