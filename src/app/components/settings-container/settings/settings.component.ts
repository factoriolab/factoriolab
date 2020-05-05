import { Component, Input, Output, EventEmitter } from '@angular/core';

import { SettingsState } from '~/store/settings';

@Component({
  selector: 'lab-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  @Input() settings: SettingsState;

  @Output() setItemPrecision = new EventEmitter<number>();
  @Output() setBeltPrecision = new EventEmitter<number>();
  @Output() setFactoryPrecision = new EventEmitter<number>();

  constructor() {}

  itemPrecisionDecimals() {
    this.setItemPrecision.emit(0);
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
    this.setBeltPrecision.emit(0);
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
    this.setFactoryPrecision.emit(0);
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
