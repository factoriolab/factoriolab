import { Component, EventEmitter, Output, Input } from '@angular/core';

import { DatasetState } from '~/store/dataset';
import { Product, RateType, CategoryId, ItemId } from '~/models';

@Component({
  selector: 'lab-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
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
  itemId = ItemId;
  rateType = RateType;

  constructor() {}

  clickEditProduct(product: Product) {
    this.editProductId = product.id;
    this.categoryId = this.data.itemEntities[product.itemId].category;
  }

  emitNumber(emitter: EventEmitter<[number, number]>, id: number, event: any) {
    if (event.target.value) {
      const value = Number(event.target.value);
      emitter.emit([id, value]);
    }
  }
}
