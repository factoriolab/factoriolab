import {
  computed,
  inject,
  Injectable,
  signal,
  TemplateRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Confirmation, Message } from 'primeng/api';
import { BehaviorSubject, fromEvent, map, Subject } from 'rxjs';

import { versionStr } from '~/helpers';

import { DataService } from './data.service';

const BREAKPOINT_SMALL = 576;

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  dataSvc = inject(DataService);

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

  isMobile = computed(() => this.width() < BREAKPOINT_SMALL);

  // Dialogs
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

  version$ = this.dataSvc.config$.pipe(map((c) => versionStr(c.version)));

  // istanbul ignore next: Helper to call browser location function
  reload(): void {
    location.reload();
  }
}
