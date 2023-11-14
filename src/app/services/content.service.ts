import { inject, Injectable, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Confirmation, Message } from 'primeng/api';
import { ConnectedOverlayScrollHandler, DomHandler } from 'primeng/dom';
import { BehaviorSubject, fromEvent, map, startWith, Subject } from 'rxjs';

import { environment } from 'src/environments';
import { APP, Breakpoint } from '~/models';

/**
 * Workaround for https://github.com/primefaces/primeng/issues/12114.
 * Manually add the main window to the list of scrollable parents, so that when
 * the main window is scrolled, dropdowns will be closed.
 */
ConnectedOverlayScrollHandler.prototype.bindScrollListener = function (
  this,
): void {
  this.scrollableParents = DomHandler.getScrollableParents(this.element);
  this.scrollableParents.push(window);
  for (const parent of this.scrollableParents) {
    parent.addEventListener('scroll', this.listener);
  }
};

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  translateSvc = inject(TranslateService);

  // Responsive
  scrollTop$ = fromEvent(window, 'scroll').pipe(
    map(
      // Don't test fromEvent
      // istanbul ignore next
      () => window.scrollY,
    ),
    startWith(window.scrollY),
  );
  windowInnerWidth = (): number => window.innerWidth;
  width$ = fromEvent(window, 'resize').pipe(
    map(this.windowInnerWidth),
    startWith(window.innerWidth),
  );
  isMobile$ = this.width$.pipe(map((width) => width < Breakpoint.Small));

  // Dialogs
  showColumns$ = new Subject<void>();
  showCosts$ = new Subject<void>();
  showToast$ = new Subject<Message>();
  showConfirm$ = new Subject<Confirmation>();

  confirm(confirmation: Confirmation): void {
    this.showConfirm$.next(confirmation);
  }

  // Templates
  translateSelectedItem$ = new BehaviorSubject<
    TemplateRef<unknown> | undefined
  >(undefined);
  translateItem$ = new BehaviorSubject<TemplateRef<unknown> | undefined>(
    undefined,
  );

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

  version = `${APP} ${environment.version}`;
}
