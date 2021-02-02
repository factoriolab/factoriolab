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
  rateTypeOptions,
  DisplayRate,
  IdType,
  IdName,
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
  @Input() productSteps: Entities<[string, Rational][]>;
  @Input() products: Product[] = [];
  @Input() displayRate: DisplayRate;

  @Output() addProduct = new EventEmitter<string>();
  @Output() removeProduct = new EventEmitter<string>();
  @Output() setItem = new EventEmitter<IdPayload>();
  @Output() setRate = new EventEmitter<IdPayload<number>>();
  @Output() setRateType = new EventEmitter<IdPayload<RateType>>();
  @Output() setVia = new EventEmitter<IdPayload>();

  RateType = RateType;
  IdType = IdType;

  get rateTypeOptions(): IdName[] {
    return rateTypeOptions(this.displayRate, this.data.isDsp);
  }

  constructor() {}

  trackBy(product: Product): string {
    return product.id;
  }

  changeItem(product: Product, itemId: string): void {
    if (
      product.rateType === RateType.Factories &&
      !this.data.itemRecipeIds[itemId]
    ) {
      // Reset rate type to items
      this.setRateType.emit({ id: product.id, value: RateType.Items });
    }

    this.setItem.emit({ id: product.id, value: itemId });
  }

  changeRate(id: string, event: InputEvent): void {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    this.setRate.emit({ id, value });
  }

  getStep(product: Product): string {
    return RecipeUtility.getProductStepData(this.productSteps, product)[0];
  }

  getOptions(product: Product): string[] {
    return this.productSteps[product.itemId].map((r) => r[0]);
  }
}
