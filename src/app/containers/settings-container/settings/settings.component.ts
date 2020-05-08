import { Component, Input, Output, EventEmitter } from '@angular/core';

import { DisplayRate, ItemId } from '~/models';
import { DatasetState } from '~/store/dataset';
import { SettingsState, initialSettingsState } from '~/store/settings';

enum OpenSelect {
  None,
  Belt,
  Assembler,
  Furnace,
  ProdModule,
  OtherModule,
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
  @Output() setProdModule = new EventEmitter<ItemId>();
  @Output() setOtherModule = new EventEmitter<ItemId>();

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
  prodModuleOptions = [
    [ItemId.Module],
    [
      ItemId.ProductivityModule,
      ItemId.ProductivityModule2,
      ItemId.ProductivityModule3,
    ],
  ];
  otherModuleOptions = [
    [ItemId.Module],
    [ItemId.SpeedModule, ItemId.SpeedModule2, ItemId.SpeedModule3],
    [
      ItemId.EfficiencyModule,
      ItemId.EfficiencyModule2,
      ItemId.EfficiencyModule3,
    ],
  ];
  displayRate = DisplayRate;
  select = OpenSelect;

  constructor() {}

  itemPrecisionDecimals() {
    this.setItemPrecision.emit(initialSettingsState.itemPrecision);
  }

  itemPrecisionValue(event: any) {
    if (event.target.value) {
      this.setItemPrecision.emit(Number(event.target.value));
    }
  }

  beltPrecisionDecimals() {
    this.setBeltPrecision.emit(initialSettingsState.beltPrecision);
  }

  beltPrecisionValue(event: any) {
    if (event.target.value) {
      this.setBeltPrecision.emit(Number(event.target.value));
    }
  }

  factoryPrecisionDecimals() {
    this.setFactoryPrecision.emit(initialSettingsState.factoryPrecision);
  }

  factoryPrecisionValue(event: any) {
    if (event.target.value) {
      this.setFactoryPrecision.emit(Number(event.target.value));
    }
  }
}
