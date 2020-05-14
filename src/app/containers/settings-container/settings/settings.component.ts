import { Component, Input, Output, EventEmitter } from '@angular/core';

import { SelectType } from '~/components';
import {
  DisplayRate,
  ItemId,
  RecipeId,
  ResearchSpeed,
  OptionsType,
} from '~/models';
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
  @Output() setFlowRate = new EventEmitter<number>();
  @Output() setProdModule = new EventEmitter<ItemId>();
  @Output() setSpeedModule = new EventEmitter<ItemId>();
  @Output() setBeaconModule = new EventEmitter<ItemId>();
  @Output() setBeaconCount = new EventEmitter<number>();
  @Output() setDrillModule = new EventEmitter<boolean>();
  @Output() setMiningBonus = new EventEmitter<number>();
  @Output() setResearchSpeed = new EventEmitter<ResearchSpeed>();

  openSelect = OpenSelect.None;

  displayRate = DisplayRate;
  itemId = ItemId;
  select = OpenSelect;
  optionsType = OptionsType;
  researchSpeed = ResearchSpeed;
  selectType = SelectType;

  initial = initialSettingsState;

  constructor() {}

  emitNumber(emitter: EventEmitter<number>, event: any) {
    if (event.target.value) {
      const value = Math.round(Number(event.target.value));
      emitter.emit(value);
    }
  }
}
