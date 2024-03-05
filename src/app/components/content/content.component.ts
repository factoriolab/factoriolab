import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ContentService } from '~/services';

@UntilDestroy()
@Component({
  selector: 'lab-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService, MessageService],
})
export class ContentComponent implements OnInit, AfterViewInit {
  confirmationSvc = inject(ConfirmationService);
  messageSvc = inject(MessageService);
  contentSvc = inject(ContentService);

  @ViewChild('translateSelectedItem') translateSelectedItem:
    | TemplateRef<unknown>
    | undefined;
  @ViewChild('translateItem') translateItem: TemplateRef<unknown> | undefined;

  ngOnInit(): void {
    this.contentSvc.showToast$
      .pipe(untilDestroyed(this))
      .subscribe((t) => this.messageSvc.add(t));
    this.contentSvc.showConfirm$
      .pipe(untilDestroyed(this))
      .subscribe((c) => this.confirmationSvc.confirm(c));
  }

  ngAfterViewInit(): void {
    this.contentSvc.translateSelectedItem$.next(this.translateSelectedItem);
    this.contentSvc.translateItem$.next(this.translateItem);
  }
}
