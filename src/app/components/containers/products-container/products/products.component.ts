import {
  Component,
  EventEmitter,
  Output,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { DatasetState } from '~/store/dataset';
import { Product, RateType, CategoryId, ItemId } from '~/models';

@Component({
  selector: 'lab-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  @Input() data: DatasetState;
  @Input() products: Product[];

  @Output() add = new EventEmitter<ItemId>();
  @Output() remove = new EventEmitter<number>();
  @Output() editProduct = new EventEmitter<[number, ItemId]>();
  @Output() editRate = new EventEmitter<[number, number]>();
  @Output() editRateType = new EventEmitter<[number, RateType]>();

  adding: boolean;
  editProductId: number;
  categoryId = CategoryId.Logistics;

  ItemId = ItemId;
  RateType = RateType;

  constructor() {}

  clickEditProduct(product: Product) {
    this.editProductId = product.id;
    this.categoryId = this.data.itemEntities[product.itemId].category;
  }

  commitEditProduct(product: Product, itemId: ItemId) {
    if (
      product.rateType === RateType.Factories &&
      !this.data.recipeEntities[itemId]
    ) {
      // Reset rate type to items
      this.editRateType.emit([product.id, RateType.Items]);
    }

    this.editProduct.emit([product.id, itemId]);
  }

  emitNumber(emitter: EventEmitter<[number, number]>, id: number, event: any) {
    if (event.target.value) {
      const value = Number(event.target.value);
      emitter.emit([id, value]);
    }
  }
}
