import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'lab-dialog-container',
  template: '',
})
export class DialogContainerComponent {
  @Input() header: string = '';

  @HostBinding('class.relative') relative = true;
  open = false;

  cancel(): void {
    this.open = false;
  }

  moduleRows(options: string[]): string[][] {
    const sorted = [...options].sort();
    const rows = [];
    let match: string | undefined;
    let row: string[] = [];
    for (const o of sorted) {
      const m = /(.+?)(-\w*\d+)?$/g.exec(o);
      if (match == null) {
        match = m?.[1] ?? '';
      }

      if (match === m?.[1]) {
        row.push(o);
      } else {
        match = m?.[1] ?? '';
        if (row.length) {
          rows.push(row);
        }
        row = [o];
      }
    }

    rows.push(row);

    return rows;
  }
}
