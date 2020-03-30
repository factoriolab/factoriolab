import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import * as data from 'src/assets/0-17.json';
import { State } from './store';
import { LoadDatasetAction } from './store/dataset';

@Component({
  selector: 'lab-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  settingsOpen: boolean;

  constructor(private store: Store<State>) {
    this.store.dispatch(new LoadDatasetAction((data as any).default));
  }

  toggleSettings() {
    this.settingsOpen = !this.settingsOpen;
  }
}
