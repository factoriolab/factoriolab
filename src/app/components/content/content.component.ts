import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ContentService } from '~/services';

@Component({
  selector: 'lab-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService, MessageService],
})
export class ContentComponent implements AfterViewInit {
  confirmationSvc = inject(ConfirmationService);
  messageSvc = inject(MessageService);
  contentSvc = inject(ContentService);

  @ViewChild('translateSelectedItem') translateSelectedItem:
    | TemplateRef<unknown>
    | undefined;
  @ViewChild('translateItem') translateItem: TemplateRef<unknown> | undefined;

  constructor() {
    this.contentSvc.showToast$
      .pipe(takeUntilDestroyed())
      .subscribe((t) => this.messageSvc.add(t));
    this.contentSvc.showConfirm$
      .pipe(takeUntilDestroyed())
      .subscribe((c) => this.confirmationSvc.confirm(c));
  }

  ngAfterViewInit(): void {
    this.contentSvc.translateSelectedItem$.next(this.translateSelectedItem);
    this.contentSvc.translateItem$.next(this.translateItem);
  }
}
