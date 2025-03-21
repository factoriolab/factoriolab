import {
  ChangeDetectorRef,
  DestroyRef,
  inject,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, Subject, switchMap } from 'rxjs';

import { areEntitiesEqual } from '~/helpers';
import { Entities } from '~/models/utils';
import { InterpolateVal, TranslateService } from '~/services/translate.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  destroyRef = inject(DestroyRef);
  ref = inject(ChangeDetectorRef);
  translateSvc = inject(TranslateService);

  params$ = new Subject<[string, Entities<InterpolateVal> | undefined]>();
  value = '';

  constructor() {
    this.params$
      .pipe(
        distinctUntilChanged(
          ([pKey, pParams], [cKey, cParams]) =>
            pKey === cKey && areEntitiesEqual(pParams, cParams),
        ),
        switchMap((params) => this.translateSvc.get(...params)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.value = value;
        this.ref.markForCheck();
      });
  }

  transform(key: string, interpolateParams?: Entities<InterpolateVal>): string {
    this.params$.next([key, interpolateParams]);
    return this.value;
  }
}
