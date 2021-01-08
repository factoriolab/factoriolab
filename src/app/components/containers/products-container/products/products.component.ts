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
  RateTypeOptions,
  DisplayRate,
  IdType,
} from '~/models';
import { RecipeUtility } from '~/utilities';

@Component({
  selector: 'lab-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  @Input() data: Dataset;
  @Input() productRecipes: Entities<[string, Rational][]>;
  @Input() products: Product[];
  @Input() displayRate: DisplayRate;

  @Output() add = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();
  @Output() setItem = new EventEmitter<IdPayload>();
  @Output() setRate = new EventEmitter<IdPayload<number>>();
  @Output() setRateType = new EventEmitter<IdPayload<RateType>>();
  @Output() setVia = new EventEmitter<IdPayload>();

  RateType = RateType;
  RateTypeOptions = RateTypeOptions;
  IdType = IdType;

  constructor() {}

  trackBy(product: Product) {
    return product.id;
  }

  changeItem(product: Product, itemId: string) {
    if (
      product.rateType === RateType.Factories &&
      !this.data.itemRecipeIds[itemId]
    ) {
      // Reset rate type to items
      this.setRateType.emit({ id: product.id, value: RateType.Items });
    }

    this.setItem.emit({ id: product.id, value: itemId });
  }

  changeRate(id: string, event: InputEvent) {
    const target = event.target as HTMLInputElement;
    const value = Number(target?.value);
    if (!isNaN(value)) {
      this.setRate.emit({ id, value });
    }
  }

  getRecipe(product: Product) {
    const recipes = this.productRecipes[product.itemId];
    return RecipeUtility.getProductRecipeData(recipes, product.viaId)[0];
  }

  getOptions(product: Product) {
    return this.productRecipes[product.itemId].map((r) => r[0]);
  }
}
