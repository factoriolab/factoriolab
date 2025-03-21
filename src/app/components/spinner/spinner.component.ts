import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FaIconComponent, SizeProp } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { TranslateService } from '~/services/translate.service';

@Component({
  selector: 'lab-spinner',
  imports: [FaIconComponent],
  templateUrl: './spinner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    class: 'contents',
  },
})
export class SpinnerComponent {
  translateSvc = inject(TranslateService);
  elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  size = input<SizeProp>();

  faSpinner = faSpinner;

  constructor() {
    this.translateSvc
      .get('loading')
      .pipe(takeUntilDestroyed())
      .subscribe((ariaLabel) => {
        this.elementRef.nativeElement.ariaLabel = ariaLabel;
      });
  }
}
