import { Component, Input, Output, EventEmitter } from '@angular/core';

import { SelectType } from '~/components';
import { DisplayRate, ItemId, RecipeId } from '~/models';
import { DatasetState } from '~/store/dataset';
import { SettingsState, initialSettingsState } from '~/store/settings';

enum OpenSelect {
  None,
  Belt,
  Assembler,
  Furnace,
  OilRecipe,
  Fuel,
  ProdModule,
  SpeedModule,
  BeaconModule,
}

@Component({
  selector: 'lab-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  @Input() data: DatasetState;
  @Input() settings: SettingsState;

  @Output() setDisplayRate = new EventEmitter<DisplayRate>();
  @Output() setItemPrecision = new EventEmitter<number>();
  @Output() setBeltPrecision = new EventEmitter<number>();
  @Output() setFactoryPrecision = new EventEmitter<number>();
  @Output() setBelt = new EventEmitter<ItemId>();
  @Output() setAssembler = new EventEmitter<ItemId>();
  @Output() setFurnace = new EventEmitter<ItemId>();
  @Output() setOilRecipe = new EventEmitter<RecipeId>();
  @Output() setFuel = new EventEmitter<ItemId>();
  @Output() setProdModule = new EventEmitter<ItemId>();
  @Output() setSpeedModule = new EventEmitter<ItemId>();
  @Output() setBeaconModule = new EventEmitter<ItemId>();
  @Output() setBeaconCount = new EventEmitter<number>();

  openSelect = OpenSelect.None;
  beltOptions = [
    ItemId.TransportBelt,
    ItemId.FastTransportBelt,
    ItemId.ExpressTransportBelt,
  ];
  assemblerOptions = [
    ItemId.AssemblingMachine1,
    ItemId.AssemblingMachine2,
    ItemId.AssemblingMachine3,
  ];
  furnaceOptions = [
    ItemId.StoneFurnace,
    ItemId.SteelFurnace,
    ItemId.ElectricFurnace,
  ];
  fuelOptions = [
    ItemId.Wood,
    ItemId.Coal,
    ItemId.SolidFuel,
    ItemId.RocketFuel,
    ItemId.NuclearFuel,
  ];
  oilRecipeOptions = [
    RecipeId.BasicOilProcessing,
    RecipeId.AdvancedOilProcessing,
    RecipeId.CoalLiquefaction,
  ];
  prodModuleOptions = [
    ItemId.Module,
    ItemId.ProductivityModule,
    ItemId.ProductivityModule2,
    ItemId.ProductivityModule3,
  ];
  speedModuleOptions = [
    ItemId.Module,
    ItemId.SpeedModule,
    ItemId.SpeedModule2,
    ItemId.SpeedModule3,
  ];

  displayRate = DisplayRate;
  select = OpenSelect;
  itemId = ItemId;
  selectType = SelectType;

  constructor() {}

  itemPrecisionDecimals() {
    this.setItemPrecision.emit(initialSettingsState.itemPrecision);
  }

  emitNumber(emitter: EventEmitter<number>, event: any) {
    if (event.target.value) {
      const value = Math.round(Number(event.target.value));
      emitter.emit(value);
    }
  }

  // itemPrecisionValue(event: any) {
  //   if (event.target.value) {
  //     const value = Math.round(Number(event.target.value));
  //     this.setItemPrecision.emit(value);
  //   }
  // }

  beltPrecisionDecimals() {
    this.setBeltPrecision.emit(initialSettingsState.beltPrecision);
  }

  // beltPrecisionValue(event: any) {
  //   if (event.target.value) {
  //     const value = Math.round(Number(event.target.value));
  //     this.setBeltPrecision.emit(value);
  //   }
  // }

  factoryPrecisionDecimals() {
    this.setFactoryPrecision.emit(initialSettingsState.factoryPrecision);
  }

  // factoryPrecisionValue(event: any) {
  //   if (event.target.value) {
  //     const value = Math.round(Number(event.target.value));
  //     this.setFactoryPrecision.emit(value);
  //   }
  // }

  // beaconCountValue(event: any) {
  //   if (event.target.value) {
  //     const value = Math.round(Number(event.target.value));
  //     this.setBeaconCount.emit(value);
  //   }
  // }
}
