import { Component, EventEmitter, Output, Input } from '@angular/core';
import Fraction from 'fraction.js';

import { Product, RateType, Category, Item } from 'src/app/models';

@Component({
  selector: 'lab-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent {
  @Input() products: Product[];
  @Input() categories: Category[];
  @Input() editProductId: number;
  @Input() categoryId: string;
  @Input() itemRows: string[][];
  @Input() itemEntities: { [id: string]: Item };

  @Output() add = new EventEmitter();
  @Output() remove = new EventEmitter<number>();
  @Output() openEditProduct = new EventEmitter<Product>();
  @Output() cancelEditProduct = new EventEmitter();
  @Output() commitEditProduct = new EventEmitter<[number, string, boolean]>();
  @Output() editRate = new EventEmitter<[number, Fraction]>();
  @Output() editType = new EventEmitter<[number, RateType]>();
  @Output() closePicker = new EventEmitter();
  @Output() selectTab = new EventEmitter<string>();

  rateType = RateType;

  constructor() {}

  clickEditProduct(product: Product, event: MouseEvent) {
    this.openEditProduct.emit(product);
    event.stopPropagation();
  }

  selectItem(id: number, itemId: string) {
    this.commitEditProduct.emit([id, itemId, !this.itemEntities[itemId].stack]);
  }

  rateChange(id: number, event: any) {
    if (event.target.value) {
      const value = event.target.value;
      if (this.products.find(p => p.id === id).rate !== value) {
        this.editRate.emit([id, new Fraction(event.target.value)]);
      }
    }
  }

  typeChange(id: number, event: any) {
    const val = parseInt(event.target.value as string, 10);
    this.editType.emit([id, val]);
  }
}
