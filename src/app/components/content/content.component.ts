import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmationService } from 'primeng/api';

import { ContentService } from '~/services';

@UntilDestroy()
@Component({
  selector: 'lab-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export class ContentComponent implements OnInit, AfterViewInit {
  @ViewChild('translateSelectedItem') translateSelectedItem:
    | TemplateRef<unknown>
    | undefined;
  @ViewChild('translateItem') translateItem: TemplateRef<unknown> | undefined;

  constructor(
    private confirmationSvc: ConfirmationService,
    private contentSvc: ContentService,
  ) {}

  ngOnInit(): void {
    this.contentSvc.showConfirm$
      .pipe(untilDestroyed(this))
      .subscribe((c) => this.confirmationSvc.confirm(c));
  }

  ngAfterViewInit(): void {
    this.contentSvc.translateSelectedItem$.next(this.translateSelectedItem);
    this.contentSvc.translateItem$.next(this.translateItem);
  }
}
