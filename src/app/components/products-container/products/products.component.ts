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
  @Input() editProductId: number;
  @Input() categoryId: CategoryId;

  @Output() add = new EventEmitter();
  @Output() remove = new EventEmitter<number>();
  @Output() openEditProduct = new EventEmitter<Product>();
  @Output() cancelEditProduct = new EventEmitter();
  @Output() commitEditProduct = new EventEmitter<[number, ItemId]>();
  @Output() editRate = new EventEmitter<[number, number]>();
  @Output() editRateType = new EventEmitter<[number, RateType]>();
  @Output() selectTab = new EventEmitter<CategoryId>();

  rateType = RateType;

  constructor() {}

  clickEditProduct(product: Product, event: MouseEvent) {
    this.openEditProduct.emit(product);
    event.stopPropagation();
  }

  selectItem(id: number, itemId: ItemId) {
    this.commitEditProduct.emit([id, itemId]);
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
