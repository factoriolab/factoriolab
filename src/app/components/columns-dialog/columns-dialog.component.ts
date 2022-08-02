import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { DialogService } from '~/services';

@UntilDestroy()
@Component({
  selector: 'lab-columns-dialog',
  templateUrl: './columns-dialog.component.html',
  styleUrls: ['./columns-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnsDialogComponent implements OnInit {
  visible = false;

  constructor(
    private ref: ChangeDetectorRef,
    private dialogSvc: DialogService
  ) {}

  ngOnInit(): void {
    this.dialogSvc.showColumns$.pipe(untilDestroyed(this)).subscribe(() => {
      this.visible = true;
      this.ref.markForCheck();
    });
  }
}
