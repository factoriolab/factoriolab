import { trigger, transition, style, animate } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as data from 'src/assets/0.18/data.json';
import { RouterService } from './services/router.service';
import { State } from './store';
import {
  LoadDatasetAction,
  DatasetState,
  getDatasetState,
} from './store/dataset';
import * as Settings from '~/store/settings';
import { getZipState, AddAction } from './store/products';

@Component({
  selector: 'lab-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ marginLeft: '-18rem', marginRight: '0' }),
        animate('300ms ease', style({ marginLeft: '0', marginRight: '*' })),
      ]),
      transition(':leave', [
        style({ marginLeft: '0', marginRight: '*' }),
        animate(
          '300ms ease',
          style({ marginLeft: '-18rem', marginRight: '0' })
        ),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit {
  settingsOpen: boolean;

  data$: Observable<DatasetState>;

  constructor(
    public router: RouterService,
    private store: Store<State>,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.store.dispatch(new LoadDatasetAction((data as any).default));
    if (!location.hash) {
      this.store.dispatch(new AddAction(data.items[0].id));
    }
  }

  ngOnInit() {
    this.data$ = this.store.select(getDatasetState);
    this.store.select(Settings.getTheme).subscribe((s) => {
      this.document.body.className = s;
    });
    this.store.select(getZipState).subscribe((s) => {
      this.router.updateUrl(s.products, s.items, s.recipes, s.settings, s.data);
    });
  }

  toggleSettings() {
    this.settingsOpen = !this.settingsOpen;
  }
}
