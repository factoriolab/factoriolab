import {
  Component,
  EventEmitter,
  Output,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Product, RateType, IdPayload, Dataset } from '~/models';

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
  @Input() products: Product[];

  @Output() add = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();
  @Output() editProduct = new EventEmitter<IdPayload>();
  @Output() editRate = new EventEmitter<IdPayload<number>>();
  @Output() editRateType = new EventEmitter<IdPayload<RateType>>();

  adding: boolean;
  editProductId: string;
  categoryId: string;

  RateType = RateType;

  constructor() {}

  clickEditProduct(product: Product) {
    this.editProductId = product.id;
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
}
