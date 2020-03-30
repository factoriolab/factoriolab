import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import Fraction from 'fraction.js';
import { Observable } from 'rxjs';

import { State } from 'src/app/store';
import { getItemEntities, getCategories } from 'src/app/store/dataset';
import {
  EditRateTypeAction,
  OpenEditProductAction,
  CancelEditProductAction,
  CommitEditProductAction,
  getEditProductId,
  getCategoryId,
  UserSelectItemCategoryAction,
  getItemRows,
  getProducts,
  AddAction,
  EditRateAction,
  RemoveAction
} from 'src/app/store/products';
import { Product, RateType, Category, Item } from 'src/app/models';

@Component({
  selector: 'lab-products-container',
  templateUrl: './products-container.component.html',
  styleUrls: ['./products-container.component.scss']
})
export class ProductsContainerComponent implements OnInit {
  products$: Observable<Product[]>;
  categories$: Observable<Category[]>;
  editProductId$: Observable<number>;
  categoryId$: Observable<string>;
  itemRows$: Observable<string[][]>;
  itemEntities$: Observable<{ [id: string]: Item }>;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.products$ = this.store.select(getProducts);
    this.categories$ = this.store.select(getCategories);
    this.editProductId$ = this.store.select(getEditProductId);
    this.categoryId$ = this.store.select(getCategoryId);
    this.itemRows$ = this.store.select(getItemRows);
    this.itemEntities$ = this.store.select(getItemEntities);
    this.add();
  }

  add() {
    this.store.dispatch(new AddAction());
  }

  remove(id: number) {
    this.store.dispatch(new RemoveAction(id));
  }

  openEditProduct(product: Product) {
    this.store.dispatch(new OpenEditProductAction(product));
  }

  cancelEditProduct() {
    this.store.dispatch(new CancelEditProductAction());
  }

  commitEditProduct(data: [number, string, boolean]) {
    this.store.dispatch(new CommitEditProductAction(data));
  }

  editRate(data: [number, Fraction]) {
    this.store.dispatch(new EditRateAction(data));
  }

  editType(data: [number, RateType]) {
    this.store.dispatch(new EditRateTypeAction(data));
  }

  closePicker() {
    this.store.dispatch(new CancelEditProductAction());
  }

  selectTab(id: string) {
    this.store.dispatch(new UserSelectItemCategoryAction(id));
  }
}
