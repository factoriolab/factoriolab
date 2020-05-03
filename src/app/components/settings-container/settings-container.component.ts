import {
  Component,
  HostListener,
  ElementRef,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { State } from '~/store';
import * as Settings from '~/store/settings';

@Component({
  selector: 'lab-settings-container',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss'],
})
export class SettingsContainerComponent implements OnInit {
  @Output() cancel = new EventEmitter();

  settings$: Observable<Settings.SettingsState>;

  constructor(private element: ElementRef, private store: Store<State>) {}

  ngOnInit() {
    this.settings$ = this.store.select(Settings.settingsState);
  }

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (!this.element.nativeElement.contains(event.target)) {
      this.cancel.emit();
    }
  }
}
