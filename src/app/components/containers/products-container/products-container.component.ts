import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  Product,
  RateType,
  IdPayload,
  Dataset,
  Rational,
  Entities,
  DisplayRate,
} from '~/models';
import { State } from '~/store';
import * as Products from '~/store/products';
import { getAdjustedDataset } from '~/store/recipes';
import { getDisplayRate } from '~/store/settings';
import { ProductsComponent } from './products/products.component';

@Component({
  selector: 'lab-products-container',
  templateUrl: './products-container.component.html',
  styleUrls: ['./products-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsContainerComponent implements OnInit {
  @ViewChild(ProductsComponent) child: ProductsComponent;

  data$: Observable<Dataset>;
  productSteps$: Observable<Entities<[string, Rational][]>>;
  products$: Observable<Product[]>;
  displayRate$: Observable<DisplayRate>;

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    this.data$ = this.store.select(getAdjustedDataset);
    this.productSteps$ = this.store.select(Products.getProductSteps);
    this.products$ = this.store.select(Products.getProducts);
    this.displayRate$ = this.store.select(getDisplayRate);
  }

  addProduct(value: string): void {
    this.store.dispatch(new Products.AddAction(value));
  }

  removeProduct(id: string): void {
    this.store.dispatch(new Products.RemoveAction(id));
  }

  setItem(data: IdPayload): void {
    this.store.dispatch(new Products.SetItemAction(data));
  }

  setRate(data: IdPayload<number>): void {
    this.store.dispatch(new Products.SetRateAction(data));
  }

  setRateType(data: IdPayload<RateType>): void {
    this.store.dispatch(new Products.SetRateTypeAction(data));
  }

  setVia(data: IdPayload): void {
    this.store.dispatch(new Products.SetViaAction(data));
  }
}
