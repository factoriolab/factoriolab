import {
  Component,
  EventEmitter,
  Output,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

import {
  Product,
  RateType,
  IdPayload,
  Dataset,
  Rational,
  Entities,
} from '~/models';
import { RecipeUtility } from '~/utilities';

export enum ProductEditType {
  Product,
  Recipe,
}

export interface ProductEdit {
  product: Product;
  type: ProductEditType;
}

@Component({
  selector: 'lab-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  _data: Dataset;
  get data() {
    return this._data;
  }
  @Input() set data(value: Dataset) {
    this._data = value;
    if (!this.categoryId) {
      this.categoryId = value.categoryIds[0];
    }
  }
  @Input() productRecipes: Entities<[string, Rational][]>;
  @Input() products: Product[];

  @Output() add = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();
  @Output() editProduct = new EventEmitter<IdPayload>();
  @Output() editRate = new EventEmitter<IdPayload<number>>();
  @Output() editRateType = new EventEmitter<IdPayload<RateType>>();
  @Output() editRecipe = new EventEmitter<IdPayload>();

  adding: boolean;
  edit: ProductEdit;
  categoryId: string;

  RateType = RateType;
  ProductEditType = ProductEditType;

  constructor() {}

  trackBy(product: Product) {
    return product.id;
  }

  clickEditProduct(product: Product) {
    this.edit = { product, type: ProductEditType.Product };
    this.categoryId = this.data.itemEntities[product.itemId].category;
  }

  commitEditProduct(product: Product, itemId: string) {
    if (
      product.rateType === RateType.Factories &&
      !this.data.itemRecipeIds[itemId]
    ) {
      // Reset rate type to items
      this.editRateType.emit({ id: product.id, value: RateType.Items });
    }

    this.editProduct.emit({ id: product.id, value: itemId });
  }

  emitNumber(emitter: EventEmitter<IdPayload<number>>, id: string, event: any) {
    if (event.target.value) {
      const value = Number(event.target.value);
      emitter.emit({ id, value });
    }
  }

  getRecipe(product: Product) {
    const recipes = this.productRecipes[product.itemId];
    return RecipeUtility.getProductRecipeData(recipes, product.recipeId)[0];
  }

  getOptions(product: Product) {
    return this.productRecipes[product.itemId].map((r) => r[0]);
  }
}
