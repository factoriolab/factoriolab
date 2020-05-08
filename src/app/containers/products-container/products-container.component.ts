import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { State } from '~/store';
import * as Dataset from '~/store/dataset';
import * as Products from '~/store/products';
import { Product, RateType, ItemId } from '~/models';
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

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.data$ = this.store.select(Dataset.getDataset);
    this.products$ = this.store.select(Products.getProducts);
  }

  add() {
    this.store.dispatch(new Products.AddAction());
  }

  remove(id: number) {
    this.store.dispatch(new Products.RemoveAction(id));
  }

  editProduct(data: [number, ItemId]) {
    this.store.dispatch(new Products.EditProductAction(data));
  }

  editRate(data: [number, number]) {
    this.store.dispatch(new Products.EditRateAction(data));
  }

  editRateType(data: [number, RateType]) {
    this.store.dispatch(new Products.EditRateTypeAction(data));
  }
}
