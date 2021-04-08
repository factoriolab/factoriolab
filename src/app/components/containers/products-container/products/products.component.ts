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
  DisplayRateOptions,
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

  @Output() removeProduct = new EventEmitter<string>();
  @Output() setItem = new EventEmitter<IdPayload>();
  @Output() setRate = new EventEmitter<IdPayload<string>>();
  @Output() setRateType = new EventEmitter<IdPayload<RateType>>();
  @Output() setVia = new EventEmitter<IdPayload>();
  @Output() addProduct = new EventEmitter<string>();
  @Output() setDisplayRate = new EventEmitter<DisplayRate>();

  DisplayRateOptions = DisplayRateOptions;

  IdType = IdType;
  RateType = RateType;

  get rateTypeOptions(): IdName[] {
    return rateTypeOptions(this.displayRate, this.data.isDsp);
  }

  constructor() {}

  trackBy(i: number, product: Product): string {
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

  changeRate(id: string, event: Event): void {
    try {
      const target = event.target as HTMLInputElement;
      const value = target.value;
      const rational = Rational.fromString(value);
      if (rational.gte(Rational.zero)) {
        this.setRate.emit({ id, value });
      }
    } catch {}
  }

  getStep(product: Product): string {
    return RecipeUtility.getProductStepData(this.productSteps, product)[0];
  }

  getOptions(product: Product): string[] {
    return this.productSteps[product.itemId].map((r) => r[0]);
  }
}
