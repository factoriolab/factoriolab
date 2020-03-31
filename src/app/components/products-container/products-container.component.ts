import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import Fraction from 'fraction.js';
import { Observable } from 'rxjs';

import { State } from '~/store';
import { getItemEntities, getCategories } from '~/store/dataset';
import * as products from '~/store/products';
import { Product, RateType, Category, Item } from '~/models';
import { ProductsComponent } from './products/products.component';

@Component({
  selector: 'lab-products-container',
  templateUrl: './products-container.component.html',
  styleUrls: ['./products-container.component.scss']
})
export class ProductsContainerComponent implements OnInit {
  @ViewChild(ProductsComponent) child: ProductsComponent;

  products$: Observable<Product[]>;
  categories$: Observable<Category[]>;
  editProductId$: Observable<number>;
  categoryId$: Observable<string>;
  itemRows$: Observable<string[][]>;
  itemEntities$: Observable<{ [id: string]: Item }>;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.products$ = this.store.select(products.getProducts);
    this.categories$ = this.store.select(getCategories);
    this.editProductId$ = this.store.select(products.getEditProductId);
    this.categoryId$ = this.store.select(products.getCategoryId);
    this.itemRows$ = this.store.select(products.getItemRows);
    this.itemEntities$ = this.store.select(getItemEntities);
    this.add();
  }

  add() {
    this.store.dispatch(new products.AddAction());
  }

  remove(id: number) {
    this.store.dispatch(new products.RemoveAction(id));
  }

  openEditProduct(product: Product) {
    this.store.dispatch(new products.OpenEditProductAction(product));
  }

  cancelEditProduct() {
    this.store.dispatch(new products.CancelEditProductAction());
  }

  commitEditProduct(data: [number, string]) {
    this.store.dispatch(new products.CommitEditProductAction(data));
  }

  editRate(data: [number, Fraction]) {
    this.store.dispatch(new products.EditRateAction(data));
  }

  editRateType(data: [number, RateType]) {
    this.store.dispatch(new products.EditRateTypeAction(data));
  }

  selectTab(id: string) {
    this.store.dispatch(new products.SelectItemCategoryAction(id));
  }
}
