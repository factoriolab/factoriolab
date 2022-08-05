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
  @ViewChild('dropdownIconSelectedItem') dropdownIconSelectedItem:
    | TemplateRef<any>
    | undefined;
  @ViewChild('dropdownIconItem') dropdownIconItem: TemplateRef<any> | undefined;
  @ViewChild('dropdownTranslateSelectedItem') dropdownTranslateSelectedItem:
    | TemplateRef<any>
    | undefined;
  @ViewChild('dropdownTranslateItem') dropdownTranslateItem:
    | TemplateRef<any>
    | undefined;

  constructor(
    private confirmationService: ConfirmationService,
    private contentSvc: ContentService
  ) {}

  ngOnInit(): void {
    this.contentSvc.showConfirm$
      .pipe(untilDestroyed(this))
      .subscribe((c) => this.confirmationService.confirm(c));
  }

  ngAfterViewInit(): void {
    this.contentSvc.dropdownIconSelectedItem$.next(
      this.dropdownIconSelectedItem
    );
    this.contentSvc.dropdownIconItem$.next(this.dropdownIconItem);
    this.contentSvc.dropdownTranslateSelectedItem$.next(
      this.dropdownTranslateSelectedItem
    );
    this.contentSvc.dropdownTranslateItem$.next(this.dropdownTranslateItem);
  }
}
