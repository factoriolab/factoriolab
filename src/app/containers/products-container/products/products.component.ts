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

  @Output() add = new EventEmitter();
  @Output() remove = new EventEmitter<number>();
  @Output() editProduct = new EventEmitter<[number, ItemId]>();
  @Output() editRate = new EventEmitter<[number, number]>();
  @Output() editRateType = new EventEmitter<[number, RateType]>();

  editProductId: number;
  categoryId: CategoryId;
  rateType = RateType;

  constructor() {}

  clickEditProduct(product: Product, event: MouseEvent) {
    this.editProductId = product.id;
    this.categoryId = this.data.itemEntities[product.itemId].category;
  }

  selectItem(id: number, itemId: ItemId) {
    this.editProduct.emit([id, itemId]);
    this.editProductId = null;
  }

  rateChange(id: number, event: any) {
    if (event.target.value) {
      const value = Number(event.target.value);
      if (this.products.find((p) => p.id === id).rate !== value) {
        this.editRate.emit([id, value]);
      }
    }
  }

  rateTypeChange(id: number, event: any) {
    const value = Number(event.target.value);
    this.editRateType.emit([id, value]);
  }
}
