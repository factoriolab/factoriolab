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
  DefaultIdPayload,
  ItemId,
  FactorySettings,
} from '~/models';
import { FactoriesState } from '~/store/factories';
import { ItemsState } from '~/store/items';
import { RecipesState } from '~/store/recipes';
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
  @Input() itemSettings: ItemsState;
  @Input() recipeSettings: RecipesState;
  @Input() factories: FactoriesState;
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
  @Output() addProduct = new EventEmitter<string>();
  @Output() setDisplayRate = new EventEmitter<DisplayRate>();

  DisplayRateOptions = DisplayRateOptions;

  IdType = IdType;
  ItemId = ItemId;
  RateType = RateType;
  RecipeUtility = RecipeUtility;

  get rateTypeOptions(): IdName<RateType>[] {
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

  // TODO: Reduce duplication of code between this component and ListComponent
  getSettings(recipeId: string): FactorySettings {
    return this.factories.entities[this.recipeSettings[recipeId].factory];
  }

  changeFactory(product: Product, recipeId: string, value: string): void {
    const def = RecipeUtility.bestMatch(
      this.data.recipeEntities[recipeId].producers,
      this.factories.ids
    );
    if (!product.viaId) {
      this.setVia.emit({ id: product.id, value: recipeId });
    }
    this.setViaSetting.emit({ id: product.id, value, default: def });
  }

  changeFactoryModule(
    product: Product,
    recipeId: string,
    value: string,
    index: number
  ): void {
    const count = this.recipeSettings[recipeId].factoryModules.length;
    const options = [...this.data.recipeModuleIds[recipeId], ItemId.Module];
    const def = RecipeUtility.defaultModules(
      options,
      this.getSettings(recipeId).moduleRank,
      count
    );
    const modules = this.generateModules(
      index,
      value,
      this.recipeSettings[recipeId].factoryModules
    );
    this.setViaFactoryModules.emit({
      id: product.id,
      value: modules,
      default: def,
    });
  }

  generateModules(index: number, value: string, original: string[]): string[] {
    if (index === 0) {
      // Copy to all
      return new Array(original.length).fill(value);
    } else {
      // Edit individual module
      const modules = [...original];
      modules[index] = value;
      return modules;
    }
  }

  changeBeaconCount(product: Product, recipeId: string, event: Event): void {
    try {
      const target = event.target as HTMLInputElement;
      const value = target.value;
      const rational = Rational.fromString(value);
      if (rational.gte(Rational.zero)) {
        const def = this.recipeSettings[recipeId].beaconCount;
        if (!product.viaId) {
          // ViaId must be specified first when modifying recipe settings
          this.setVia.emit({ id: product.id, value: recipeId });
        }
        this.setViaBeaconCount.emit({ id: product.id, value, default: def });
      }
    } catch {}
  }
}
