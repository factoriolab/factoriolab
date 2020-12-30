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
} from '~/models';
import { State } from '~/store';
import * as Products from '~/store/products';
import { getAdjustedDataset } from '~/store/recipes';
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
  productRecipes$: Observable<Entities<[string, Rational][]>>;
  products$: Observable<Product[]>;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.data$ = this.store.select(getAdjustedDataset);
    this.productRecipes$ = this.store.select(Products.getProductRecipes);
    this.products$ = this.store.select(Products.getProducts);
  }

  add(value: string) {
    this.store.dispatch(new Products.AddAction(value));
  }

  remove(id: string) {
    this.store.dispatch(new Products.RemoveAction(id));
  }

  setItem(data: IdPayload) {
    this.store.dispatch(new Products.SetItemAction(data));
  }

  setRate(data: IdPayload<number>) {
    this.store.dispatch(new Products.SetRateAction(data));
  }

  setRateType(data: IdPayload<RateType>) {
    this.store.dispatch(new Products.SetRateTypeAction(data));
  }

  setRecipe(data: IdPayload) {
    this.store.dispatch(new Products.SetRecipeAction(data));
  }
}
