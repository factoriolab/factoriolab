import { Injectable, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Confirmation } from 'primeng/api';
import { BehaviorSubject, fromEvent, map, startWith, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  // Responsive
  scrollTop$ = fromEvent(window, 'scroll').pipe(
    map(
      // Don't test fromEvent
      // istanbul ignore next
      () => window.scrollY
    ),
    startWith(window.scrollY)
  );
  width$ = fromEvent(window, 'resize').pipe(
    map(() => window.innerWidth),
    startWith(window.innerWidth)
  );

  // Dialogs
  showColumns$ = new Subject<void>();
  showConfirm$ = new Subject<Confirmation>();

  confirm(confirmation: Confirmation): void {
    this.showConfirm$.next(confirmation);
  }

  // Templates
  translateSelectedItem$ = new BehaviorSubject<TemplateRef<any> | undefined>(
    undefined
  );
  translateItem$ = new BehaviorSubject<TemplateRef<any> | undefined>(undefined);

  // Header
  settingsActive$ = new BehaviorSubject(false);
  settingsXlHidden$ = new BehaviorSubject(false);

  toggleSettings(): void {
    this.settingsActive$.next(!this.settingsActive$.value);
  }

  toggleSettingsXl(): void {
    this.settingsXlHidden$.next(!this.settingsXlHidden$.value);
  }

  // Watch all language changes
  lang$ = this.translateSvc.onLangChange.pipe(startWith(''));

  constructor(private router: Router, private translateSvc: TranslateService) {}
}
