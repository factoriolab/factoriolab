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
import { ConnectedOverlayScrollHandler, DomHandler } from 'primeng/dom';
import { OrderList } from 'primeng/orderlist';
import { ToastModule } from 'primeng/toast';

import { TranslatePipe } from '~/pipes';
import { ContentService } from '~/services';

/**
 * Workaround for https://github.com/primefaces/primeng/issues/12114.
 * Manually add the main window to the list of scrollable parents, so that when
 * the main window is scrolled, dropdowns will be closed.
 */
ConnectedOverlayScrollHandler.prototype.bindScrollListener = function (
  this,
): void {
  this.scrollableParents = DomHandler.getScrollableParents(this.element);
  this.scrollableParents.push(window);
  for (const parent of this.scrollableParents)
    parent.addEventListener('scroll', this.listener);
};

// istanbul ignore next
/** Allow entering spaces inside orderlist items */
OrderList.prototype.onSpaceKey = function (): void {};

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
    this.contentSvc.showToast$
      .pipe(takeUntilDestroyed())
      .subscribe((t) => this.messageSvc.add(t));
    this.contentSvc.showConfirm$
      .pipe(takeUntilDestroyed())
      .subscribe((c) => this.confirmationSvc.confirm(c));
  }

  ngAfterViewInit(): void {
    this.contentSvc.translateSelectedItem$.next(this.translateSelectedItem());
    this.contentSvc.translateItem$.next(this.translateItem());
  }
}
