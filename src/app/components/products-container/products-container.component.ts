import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import Fraction from 'fraction.js';
import { Observable } from 'rxjs';

import { State } from '~/store';
import * as Dataset from '~/store/dataset';
import * as Products from '~/store/products';
import { Product, RateType, ItemId, CategoryId } from '~/models';
import { ProductsComponent } from './products/products.component';

@Component({
  selector: 'lab-products-container',
  templateUrl: './products-container.component.html',
  styleUrls: ['./products-container.component.scss'],
})
export class ProductsContainerComponent implements OnInit {
  @ViewChild(ProductsComponent) child: ProductsComponent;

  data$: Observable<Dataset.DatasetState>;
  products$: Observable<Product[]>;
  editProductId$: Observable<number>;
  categoryId$: Observable<string>;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.data$ = this.store.select(Dataset.getDataset);
    this.products$ = this.store.select(Products.getProducts);
    this.editProductId$ = this.store.select(Products.getEditProductId);
    this.categoryId$ = this.store.select(Products.getCategoryId);
  }

  add() {
    this.store.dispatch(new Products.AddAction());
  }

  remove(id: number) {
    this.store.dispatch(new Products.RemoveAction(id));
  }

  openEditProduct(product: Product) {
    this.store.dispatch(new Products.OpenEditProductAction(product));
  }

  cancelEditProduct() {
    this.store.dispatch(new Products.CancelEditProductAction());
  }

  commitEditProduct(data: [number, ItemId]) {
    this.store.dispatch(new Products.CommitEditProductAction(data));
  }

  editRate(data: [number, number]) {
    this.store.dispatch(new Products.EditRateAction(data));
  }

  editRateType(data: [number, RateType]) {
    this.store.dispatch(new Products.EditRateTypeAction(data));
  }

  selectTab(id: CategoryId) {
    this.store.dispatch(new Products.SelectItemCategoryAction(id));
  }
}
