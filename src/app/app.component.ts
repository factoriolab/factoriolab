import { trigger, transition, style, animate } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Dataset } from './models';
import { RouterService } from './services/router.service';
import { State } from './store';
import { getZipState } from './store/products';
import { getDataset, getTheme } from './store/settings';

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

  data$: Observable<Dataset>;

  constructor(
    public router: RouterService,
    private store: Store<State>,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.data$ = this.store.select(getDataset);
    this.store.select(getTheme).subscribe((s) => {
      this.document.body.className = s;
    });
    this.store
      .select(getZipState)
      .pipe(filter((s) => !!s.defaults))
      .subscribe((s) => {
        this.router.updateUrl(
          s.products,
          s.items,
          s.recipes,
          s.settings,
          s.defaults
        );
      });
  }

  toggleSettings() {
    this.settingsOpen = !this.settingsOpen;
  }
}
