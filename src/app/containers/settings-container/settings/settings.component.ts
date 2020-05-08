import { Component, Input, Output, EventEmitter } from '@angular/core';

import { DisplayRate, ItemId } from '~/models';
import { DatasetState } from '~/store/dataset';
import { SettingsState, initialSettingsState } from '~/store/settings';

enum OpenSelect {
  None,
  Assembler,
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
  @Output() setAssembler = new EventEmitter<ItemId>();

  openSelect = OpenSelect.None;
  assemblerOptions = [
    ItemId.AssemblingMachine1,
    ItemId.AssemblingMachine2,
    ItemId.AssemblingMachine3,
  ];
  displayRate = DisplayRate;
  open = OpenSelect;

  constructor() {}

  displayRateChange(value: DisplayRate) {
    this.setDisplayRate.emit(value);
  }

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

  openAssembler(event: MouseEvent) {
    this.openSelect = OpenSelect.Assembler;
    event.stopPropagation();
  }

  selectAssembler(value: ItemId) {
    this.openSelect = OpenSelect.None;
    this.setAssembler.emit(value);
  }
}
