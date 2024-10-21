import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OrderList } from 'primeng/orderlist';
import { ToastModule } from 'primeng/toast';

import { TranslatePipe } from '~/pipes/translate.pipe';
import { ContentService } from '~/services/content.service';

// istanbul ignore next: Don't test empty function override
/** Allow entering spaces inside orderlist items */
OrderList.prototype.onSpaceKey = function (): void {
  // Ignore space key
};

@Component({
  selector: 'lab-content',
  standalone: true,
  imports: [ConfirmDialogModule, ToastModule, TranslatePipe],
  templateUrl: './content.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService, MessageService],
})
export class ContentComponent implements AfterViewInit {
  confirmationSvc = inject(ConfirmationService);
  messageSvc = inject(MessageService);
  contentSvc = inject(ContentService);

  translateSelectedItem = viewChild.required<TemplateRef<unknown>>(
    'translateSelectedItem',
  );
  translateItem = viewChild.required<TemplateRef<unknown>>('translateItem');

  constructor() {
    this.contentSvc.showToast$.pipe(takeUntilDestroyed()).subscribe((t) => {
      this.messageSvc.add(t);
    });
    this.contentSvc.showConfirm$
      .pipe(takeUntilDestroyed())
      .subscribe((c) => this.confirmationSvc.confirm(c));
  }

  ngAfterViewInit(): void {
    this.contentSvc.translateSelectedItem$.next(this.translateSelectedItem());
    this.contentSvc.translateItem$.next(this.translateItem());
  }
}
