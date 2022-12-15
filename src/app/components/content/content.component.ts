import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewChild,
} from '@angular/core';

import { ContentService } from '~/services';

@Component({
  selector: 'lab-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentComponent implements AfterViewInit {
  @ViewChild('translateSelectedItem') translateSelectedItem:
    | TemplateRef<unknown>
    | undefined;
  @ViewChild('translateItem') translateItem: TemplateRef<unknown> | undefined;

  constructor(private contentSvc: ContentService) {}

  ngAfterViewInit(): void {
    this.contentSvc.translateSelectedItem$.next(this.translateSelectedItem);
    this.contentSvc.translateItem$.next(this.translateItem);
  }
}
