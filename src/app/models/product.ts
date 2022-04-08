import { RateType } from './enum/rate-type';
import { Rational } from './rational';

export interface Product {
  id: string;
  itemId: string;
  rate: string;
  rateType: RateType;
  viaId?: string;
  viaSetting?: string;
  viaFactoryModules?: string[];
  viaBeaconCount?: string;
  viaBeacon?: string;
  viaBeaconModules?: string[];
  viaOverclock?: number;
}

export class RationalProduct {
  id: string;
  itemId: string;
  rate: Rational;
  rateType: RateType;
  viaId?: string;
  viaSetting?: string;
  viaFactoryModules?: string[];
  viaBeaconCount?: Rational;
  viaBeacon?: string;
  viaBeaconModules?: string[];
  viaOverclock?: Rational;

  constructor(data: Product) {
    this.id = data.id;
    this.itemId = data.itemId;
    this.rate = Rational.fromString(data.rate);
    this.rateType = data.rateType;
    if (data.viaId) {
      this.viaId = data.viaId;
    }
    if (data.viaSetting) {
      this.viaSetting = data.viaSetting;
    }
    if (data.viaFactoryModules) {
      this.viaFactoryModules = data.viaFactoryModules;
    }
    if (data.viaBeaconCount != null) {
      this.viaBeaconCount = Rational.fromString(data.viaBeaconCount);
    }
    if (data.viaBeacon != null) {
      this.viaBeacon = data.viaBeacon;
    }
    if (data.viaBeaconModules != null) {
      this.viaBeaconModules = data.viaBeaconModules;
    }
    if (data.viaOverclock != null) {
      this.viaOverclock = Rational.fromNumber(data.viaOverclock);
    }
  }
}
