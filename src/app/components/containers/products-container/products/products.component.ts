import {
  Component,
  EventEmitter,
  Output,
  Input,
  ChangeDetectionStrategy,
  OnChanges,
} from '@angular/core';

import {
  Product,
  RateType,
  IdPayload,
  Rational,
  Entities,
  rateTypeOptions,
  DisplayRate,
  IdType,
  IdName,
  DisplayRateOptions,
  DefaultIdPayload,
  ItemId,
  Game,
  PIPE,
} from '~/models';
import { ItemsState } from '~/store/items';
import { RecipeUtility } from '~/utilities';
import { RecipeSettingsComponent } from '../../recipe-settings.component';

@Component({
  selector: 'lab-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent
  extends RecipeSettingsComponent
  implements OnChanges
{
  @Input() productSteps: Entities<[string, Rational][]>;
  @Input() products: Product[] = [];
  @Input() itemSettings: ItemsState;
  @Input() displayRate: DisplayRate;

  @Output() removeProduct = new EventEmitter<string>();
  @Output() setItem = new EventEmitter<IdPayload>();
  @Output() setRate = new EventEmitter<IdPayload<string>>();
  @Output() setRateType = new EventEmitter<IdPayload<RateType>>();
  @Output() setVia = new EventEmitter<IdPayload>();
  @Output() setViaSetting = new EventEmitter<DefaultIdPayload>();
  @Output() setViaFactoryModules = new EventEmitter<
    DefaultIdPayload<string[]>
  >();
  @Output() setViaBeaconCount = new EventEmitter<DefaultIdPayload>();
  @Output() setViaBeacon = new EventEmitter<DefaultIdPayload>();
  @Output() setViaBeaconModules = new EventEmitter<
    DefaultIdPayload<string[]>
  >();
  @Output() setViaOverclock = new EventEmitter<DefaultIdPayload<number>>();
  @Output() addProduct = new EventEmitter<string>();
  @Output() setDisplayRate = new EventEmitter<DisplayRate>();

  DisplayRateOptions = DisplayRateOptions;
  rateTypeOptions: IdName<RateType>[];
  productOptions: Entities<string[]>;

  IdType = IdType;
  ItemId = ItemId;
  RateType = RateType;
  Game = Game;
  RecipeUtility = RecipeUtility;
  PIPE = PIPE;

  constructor() {
    super();
  }

  ngOnChanges(): void {
    this.rateTypeOptions = rateTypeOptions(this.displayRate, this.data.game);
    this.productOptions = {};
    for (const p of this.products) {
      this.productOptions[p.id] = this.productSteps[p.itemId].map((r) => r[0]);
    }
  }

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
}
