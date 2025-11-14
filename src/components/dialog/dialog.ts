import { CdkDialogContainer, DialogRef } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
} from '@angular/core';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import { TranslateParams } from '~/translate/translate';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Button } from '../button/button';

export interface DialogData {
  header?: string;
  headerParams?: TranslateParams;
}

@Component({
  selector: 'lab-dialog',
  imports: [CdkPortalOutlet, Button, TranslatePipe],
  templateUrl: './dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex max-w-dvw flex-col rounded-xs border border-gray-600 bg-gray-950 transition-all starting:scale-75 starting:opacity-0',
  },
})
export class Dialog extends CdkDialogContainer implements OnInit {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly dialogRef = inject(DialogRef);

  protected faXmark = faXmark;

  protected header?: string;
  protected headerParams?: TranslateParams;

  ngOnInit(): void {
    this.parseData();
  }

  parseData(): void {
    let data: DialogData | undefined;
    const componentData = this.dialogRef.componentInstance as DialogData;
    if (componentData?.header) data = componentData;
    else {
      const configData = this.dialogRef.config.data as DialogData;
      if (configData?.header) data = configData;
    }

    this.header = data?.header;
    this.headerParams = data?.headerParams;
  }

  animateClose(result?: unknown): void {
    this.elementRef.nativeElement.classList.add('animate-fade');
    this.elementRef.nativeElement.addEventListener('animationend', () => {
      this.dialogRef.close(result);
    });
  }
}
