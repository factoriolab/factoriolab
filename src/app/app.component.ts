import { trigger, transition, style, animate } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { skip } from 'rxjs/operators';

import { Dataset, SETTINGS_KEY } from './models';
import { RouterService } from './services/router.service';
import { State } from './store';
import { getZipState } from './store/products';
import * as Settings from './store/settings';

@Component({
  selector: 'lab-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('slideUpDown', [
      transition(':enter', [
        style({ marginTop: '-3rem' }),
        animate('300ms ease', style({ marginTop: '0' })),
      ]),
      transition(':leave', [
        style({ marginTop: '0' }),
        animate('300ms ease', style({ marginTop: '-3rem' })),
      ]),
    ]),
    trigger('slideLeftRight', [
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

  data$: Observable<Dataset>;
  showHeader$: Observable<boolean>;

  constructor(
    public router: RouterService,
    private store: Store<State>,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.data$ = this.store.select(Settings.getDataset);
    this.showHeader$ = this.store.select(Settings.getShowHeader);
    this.store.select(Settings.getTheme).subscribe((s) => {
      this.document.body.className = s;
    });
    this.store
      .select(getZipState)
      .pipe(skip(1))
      .subscribe((s) => {
        this.router.updateUrl(s.products, s.items, s.recipes, s.settings);
      });
    this.store.select(Settings.settingsState).subscribe((s) => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    });
  }

  toggleSettings() {
    this.settingsOpen = !this.settingsOpen;
  }

  showHeader() {
    this.store.dispatch(new Settings.ShowHeaderAction());
  }

  hideHeader() {
    this.store.dispatch(new Settings.HideHeaderAction());
  }
}
