import { Component, Input, Output, EventEmitter } from '@angular/core';

import { DisplayRate } from '~/models';
import { SettingsState, initialSettingsState } from '~/store/settings';

@Component({
  selector: 'lab-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  @Input() settings: SettingsState;

  @Output() setDisplayRate = new EventEmitter<DisplayRate>();
  @Output() setItemPrecision = new EventEmitter<number>();
  @Output() setBeltPrecision = new EventEmitter<number>();
  @Output() setFactoryPrecision = new EventEmitter<number>();

  displayRate = DisplayRate;

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

  itemPrecisionFractions() {
    this.setItemPrecision.emit(null);
  }

  beltPrecisionDecimals() {
    this.setBeltPrecision.emit(initialSettingsState.beltPrecision);
  }

  beltPrecisionValue(event: any) {
    if (event.target.value) {
      this.setBeltPrecision.emit(Number(event.target.value));
    }
  }

  beltPrecisionFractions() {
    this.setBeltPrecision.emit(null);
  }

  factoryPrecisionDecimals() {
    this.setFactoryPrecision.emit(initialSettingsState.factoryPrecision);
  }

  factoryPrecisionValue(event: any) {
    if (event.target.value) {
      this.setFactoryPrecision.emit(Number(event.target.value));
    }
  }

  factoryPrecisionFractions() {
    this.setFactoryPrecision.emit(null);
  }
}
