import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  Dataset,
  ItemId,
  Mod,
  Product,
  TITLE_DSP,
  TITLE_LAB,
  APP,
} from './models';
import { ErrorService, RouterService, StateService } from './services';
import { State } from './store';
import { getProducts } from './store/products';
import { getDataset, getDatasets, getIsDsp } from './store/settings';

@Component({
  selector: 'lab-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('slideLeftRight', [
      transition(':enter', [
        style({ marginLeft: '-25rem', marginRight: '1rem', opacity: 0 }),
        animate(
          '300ms ease',
          style({ marginLeft: '*', marginRight: '*', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        style({ marginLeft: '*', marginRight: '*', opacity: 1 }),
        animate(
          '300ms ease',
          style({ marginLeft: '-25rem', marginRight: '1rem', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit {
  datasets$: Observable<Mod[]>;
  data$: Observable<Dataset>;
  products$: Observable<Product[]>;

  ItemId = ItemId;
  TITLE_LAB = TITLE_LAB;
  TITLE_DSP = TITLE_DSP;

  title: string;
  showSettings: boolean;
  poll = 'https://linkto.run/p/0UD8IV6X';
  pollKey = 'poll0';
  showPoll = false;

  get lsHidePoll(): boolean {
    return !!localStorage.getItem(this.pollKey);
  }

  constructor(
    public error: ErrorService,
    public router: RouterService,
    public store: Store<State>,
    public titleService: Title,
    public state: StateService // Included only to initialize the service
  ) {}

  homeHref(isDsp: boolean): string {
    return isDsp ? 'list?s=dsp' : 'list?p=';
  }

  ngOnInit(): void {
    this.datasets$ = this.store.select(getDatasets);
    this.data$ = this.store.select(getDataset);
    this.products$ = this.store.select(getProducts);
    this.store.select(getIsDsp).subscribe((dsp) => {
      this.title = dsp ? TITLE_DSP : TITLE_LAB;
      this.titleService.setTitle(`${APP} | ${this.title}`);
    });
    if (this.lsHidePoll) {
      this.showPoll = false;
    }
  }

  hidePoll(persist = false): void {
    if (persist) {
      localStorage.setItem(this.pollKey, 'hide');
    }
    this.showPoll = false;
  }
}
