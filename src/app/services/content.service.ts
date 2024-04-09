import {
  computed,
  inject,
  Injectable,
  signal,
  TemplateRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { Confirmation, Message } from 'primeng/api';
import { BehaviorSubject, fromEvent, map, startWith, Subject } from 'rxjs';

import { environment } from 'src/environments';
import { APP, Breakpoint } from '~/models';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  translateSvc = inject(TranslateService);

  // Responsive
  windowScrollY = (): number => window.scrollY;
  windowInnerWidth = (): number => window.innerWidth;
  scrollTop = toSignal(
    fromEvent(window, 'scroll').pipe(map(this.windowScrollY)),
    { initialValue: window.scrollY },
  );
  width = toSignal(
    fromEvent(window, 'resize').pipe(map(this.windowInnerWidth)),
    { initialValue: window.innerWidth },
  );

  isMobile = computed(() => this.width() < Breakpoint.Small);

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
  settingsActive = signal(false);
  settingsXlHidden = signal(false);

  toggleSettings(): void {
    this.settingsActive.set(!this.settingsActive());
  }

  toggleSettingsXl(): void {
    this.settingsXlHidden.set(!this.settingsXlHidden());
  }

  // Watch all language changes
  lang$ = this.translateSvc.onLangChange.pipe(startWith(''));

  version = `${APP} ${environment.version}`;
}
