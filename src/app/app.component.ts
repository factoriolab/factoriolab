import { trigger, transition, style, animate } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { skip } from 'rxjs/operators';

import { Dataset } from './models';
import { RouterService } from './services/router.service';
import { State } from './store';
import * as Preferences from './store/preferences';
import { getZipState } from './store/products';
import { getDataset } from './store/settings';

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
        style({ marginLeft: '-20rem', marginRight: '0' }),
        animate('300ms ease', style({ marginLeft: '0', marginRight: '*' })),
      ]),
      transition(':leave', [
        style({ marginLeft: '0', marginRight: '*' }),
        animate(
          '300ms ease',
          style({ marginLeft: '-20rem', marginRight: '0' })
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
    this.data$ = this.store.select(getDataset);
    this.showHeader$ = this.store.select(Preferences.getShowHeader);
    this.store.select(Preferences.getTheme).subscribe((s) => {
      this.document.body.className = s;
    });
    this.store
      .select(getZipState)
      .pipe(skip(1))
      .subscribe((s) => {
        this.router.updateUrl(s.products, s.items, s.recipes, s.settings);
      });
  }

  toggleSettings() {
    this.settingsOpen = !this.settingsOpen;
  }

  showHeader() {
    this.store.dispatch(new Preferences.ShowHeaderAction());
  }

  hideHeader() {
    this.store.dispatch(new Preferences.HideHeaderAction());
  }
}
