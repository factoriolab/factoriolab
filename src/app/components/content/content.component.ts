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
  @ViewChild('iconTextSelectedItem') iconTextSelectedItem:
    | TemplateRef<any>
    | undefined;
  @ViewChild('iconTextItem') iconTextItem: TemplateRef<any> | undefined;
  @ViewChild('iconSelectedItem') iconSelectedItem: TemplateRef<any> | undefined;
  @ViewChild('iconTextSelectedRecipe') iconTextSelectedRecipe:
    | TemplateRef<any>
    | undefined;
  @ViewChild('iconTextRecipe') iconTextRecipe: TemplateRef<any> | undefined;
  @ViewChild('iconSelectedRecipe') iconSelectedRecipe:
    | TemplateRef<any>
    | undefined;
  @ViewChild('translateSelectedItem') translateSelectedItem:
    | TemplateRef<any>
    | undefined;
  @ViewChild('translateItem') translateItem: TemplateRef<any> | undefined;

  constructor(
    private confirmationSvc: ConfirmationService,
    private contentSvc: ContentService
  ) {}

  ngOnInit(): void {
    this.contentSvc.showConfirm$
      .pipe(untilDestroyed(this))
      .subscribe((c) => this.confirmationSvc.confirm(c));
  }

  ngAfterViewInit(): void {
    this.contentSvc.iconTextSelectedItem$.next(this.iconTextSelectedItem);
    this.contentSvc.iconTextItem$.next(this.iconTextItem);
    this.contentSvc.iconSelectedItem$.next(this.iconSelectedItem);
    this.contentSvc.translateSelectedItem$.next(this.translateSelectedItem);
    this.contentSvc.translateItem$.next(this.translateItem);
  }
}
