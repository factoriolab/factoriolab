import { Injectable, TemplateRef } from '@angular/core';
import { Confirmation } from 'primeng/api';
import { BehaviorSubject, fromEvent, map, startWith, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  // Responsive
  width$ = fromEvent(window, 'resize').pipe(
    map((ev: any) => ev.target.innerWidth),
    startWith(window.innerWidth)
  );
  scrollTop$ = fromEvent(window, 'scroll').pipe(
    map((ev) => window.scrollY),
    startWith(window.scrollY)
  );

  // Dialogs
  showColumns$ = new Subject<void>();
  showConfirm$ = new Subject<Confirmation>();

  confirm(confirmation: Confirmation): void {
    this.showConfirm$.next(confirmation);
  }

  // Templates
  dropdownIconSelectedItem$ = new BehaviorSubject<TemplateRef<any> | undefined>(
    undefined
  );
  dropdownIconItem$ = new BehaviorSubject<TemplateRef<any> | undefined>(
    undefined
  );
  dropdownTranslateSelectedItem$ = new BehaviorSubject<
    TemplateRef<any> | undefined
  >(undefined);
  dropdownTranslateItem$ = new BehaviorSubject<TemplateRef<any> | undefined>(
    undefined
  );
}
