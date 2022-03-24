import {
  Component,
  EventEmitter,
  Output,
  Input,
  ChangeDetectionStrategy,
  OnChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import {
  Product,
  RateType,
  IdPayload,
  Rational,
  Entities,
  rateTypeOptions,
  DisplayRate,
  IdType,
  DisplayRateOptions,
  DefaultIdPayload,
  ItemId,
  Game,
  PIPE,
  PreviousPayload,
  Dataset,
} from '~/models';
import { TrackService } from '~/services';
import { LabState } from '~/store';
import * as Items from '~/store/items';
import * as Settings from '~/store/settings';
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
  displayRate$ = this.store.select(Settings.getDisplayRate);

  rateTypeOptions$ = combineLatest([this.displayRate$, this.data$]).pipe(
    map(([displayRate, data]) => rateTypeOptions(displayRate, data.game))
  );

  @Input() productSteps: Entities<[string, Rational][]>;
  @Input() products: Product[] = [];
  @Input() itemSettings: Items.ItemsState;

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
  @Output() setDisplayRate = new EventEmitter<PreviousPayload<DisplayRate>>();

  DisplayRateOptions = DisplayRateOptions;
  productOptions: Entities<string[]>;

  IdType = IdType;
  ItemId = ItemId;
  RateType = RateType;
  Game = Game;
  RecipeUtility = RecipeUtility;
  PIPE = PIPE;

  constructor(public track: TrackService, store: Store<LabState>) {
    super(store);
  }

  ngOnChanges(): void {
    this.productOptions = {};
    for (const p of this.products) {
      this.productOptions[p.id] = this.productSteps[p.itemId].map((r) => r[0]);
    }
  }

  changeItem(product: Product, itemId: string, data: Dataset): void {
    if (
      product.rateType === RateType.Factories &&
      !data.itemRecipeIds[itemId]
    ) {
      // Reset rate type to items
      this.setRateType.emit({ id: product.id, value: RateType.Items });
    }

    this.setItem.emit({ id: product.id, value: itemId });
  }
}
