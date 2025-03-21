import { CdkDialogContainer } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lab-dialog',
  imports: [CdkPortalOutlet],
  templateUrl: './dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent extends CdkDialogContainer {}
