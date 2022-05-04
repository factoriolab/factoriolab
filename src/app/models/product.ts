import { RateType } from './enum/rate-type';
import { Rational } from './rational';

export interface Product {
  id: string;
  itemId: string;
  rate: string;
  rateType: RateType;
  viaId?: string;
  viaSetting?: string;
  viaFactoryModuleIds?: string[];
  viaBeaconCount?: string;
  viaBeaconId?: string;
  viaBeaconModuleIds?: string[];
  viaOverclock?: number;
}

export class RationalProduct {
  id: string;
  itemId: string;
  rate: Rational;
  rateType: RateType;
  viaId?: string;
  viaSetting?: string;
  viaFactoryModuleIds?: string[];
  viaBeaconCount?: Rational;
  viaBeaconId?: string;
  viaBeaconModuleIds?: string[];
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
    if (data.viaFactoryModuleIds) {
      this.viaFactoryModuleIds = data.viaFactoryModuleIds;
    }
    if (data.viaBeaconCount != null) {
      this.viaBeaconCount = Rational.fromString(data.viaBeaconCount);
    }
    if (data.viaBeaconId != null) {
      this.viaBeaconId = data.viaBeaconId;
    }
    if (data.viaBeaconModuleIds != null) {
      this.viaBeaconModuleIds = data.viaBeaconModuleIds;
    }
    if (data.viaOverclock != null) {
      this.viaOverclock = Rational.fromNumber(data.viaOverclock);
    }
  }
}
