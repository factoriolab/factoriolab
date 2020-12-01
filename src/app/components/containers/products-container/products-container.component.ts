import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Product, RateType, IdPayload, Dataset, ItemSettings } from '~/models';
import { State } from '~/store';
import { getItemSettings } from '~/store/items';
import * as Products from '~/store/products';
import { getAdjustedDataset } from '~/store/recipes';
import { getDisabledRecipes } from '~/store/settings';
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
  itemSettings$: Observable<ItemSettings>;
  disabledRecipes$: Observable<string[]>;
  products$: Observable<Product[]>;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.data$ = this.store.select(getAdjustedDataset);
    this.itemSettings$ = this.store.select(getItemSettings);
    this.disabledRecipes$ = this.store.select(getDisabledRecipes);
    this.products$ = this.store.select(Products.getProducts);
  }

  add(value: string) {
    this.store.dispatch(new Products.AddAction(value));
  }

  remove(id: string) {
    this.store.dispatch(new Products.RemoveAction(id));
  }

  editProduct(data: IdPayload) {
    this.store.dispatch(new Products.EditProductAction(data));
  }

  editRate(data: IdPayload<number>) {
    this.store.dispatch(new Products.EditRateAction(data));
  }

  editRateType(data: IdPayload<RateType>) {
    this.store.dispatch(new Products.EditRateTypeAction(data));
  }
}
