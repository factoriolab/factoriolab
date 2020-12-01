import {
  Component,
  EventEmitter,
  Output,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Product, RateType, IdPayload, Dataset, ItemSettings } from '~/models';
import { SimplexUtility } from '~/utilities';

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
  @Input() set data(value: Dataset) {
    this._data = value;
    if (!this.categoryId) {
      this.categoryId = value.categoryIds[0];
    }
  }
  get data() {
    return this._data;
  }
  @Input() itemSettings: ItemSettings;
  @Input() disabledRecipes: string[];
  @Input() products: Product[];

  @Output() add = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();
  @Output() editProduct = new EventEmitter<IdPayload>();
  @Output() editRate = new EventEmitter<IdPayload<number>>();
  @Output() editRateType = new EventEmitter<IdPayload<RateType>>();
  @Output() editRecipeId = new EventEmitter<IdPayload>();

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
    const recipes = SimplexUtility.getRecipes(
      product.itemId,
      this.itemSettings,
      this.disabledRecipes,
      this.data
    );
    if (recipes.length === 0) {
      return null;
    } else if (product.recipeId) {
      const tuple = recipes.find((r) => r[0] === product.recipeId);
      if (tuple) {
        return tuple[0];
      }
    }
    return recipes[0][0];
  }
}
