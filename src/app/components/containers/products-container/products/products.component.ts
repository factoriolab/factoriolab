import {
  Component,
  EventEmitter,
  Output,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { DatasetState } from '~/store/dataset';
import { Product, RateType, IdPayload } from '~/models';

@Component({
  selector: 'lab-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  @Input() data: DatasetState;
  @Input() products: Product[];

  @Output() add = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();
  @Output() editProduct = new EventEmitter<IdPayload<string>>();
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
      !this.data.recipeEntities[itemId]
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
