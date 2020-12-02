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
  complexRecipes$: Observable<Entities<[string, Rational][]>>;
  products$: Observable<Product[]>;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.data$ = this.store.select(getAdjustedDataset);
    this.complexRecipes$ = this.store.select(Products.getComplexItemRecipes);
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

  editRecipe(data: IdPayload) {
    this.store.dispatch(new Products.EditRecipeAction(data));
  }
}
