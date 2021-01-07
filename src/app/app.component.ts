import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { skip } from 'rxjs/operators';

import { Dataset, ItemId, Product } from './models';
import { RouterService } from './services/router.service';
import { State } from './store';
import { getProducts, getZipState } from './store/products';
import { getDataset } from './store/settings';

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
  data$: Observable<Dataset>;
  products$: Observable<Product[]>;

  ItemId = ItemId;

  showSettings: boolean;

  constructor(public router: RouterService, private store: Store<State>) {}

  ngOnInit() {
    this.data$ = this.store.select(getDataset);
    this.products$ = this.store.select(getProducts);
    this.store
      .select(getZipState)
      .pipe(skip(1))
      .subscribe((s) => {
        this.router.updateUrl(
          s.products,
          s.items,
          s.recipes,
          s.factories,
          s.settings
        );
      });
  }
}
