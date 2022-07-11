import { Rational } from '../rational';
import { RationalSilo, Silo } from './silo';

export interface Factory {
  speed?: number;
  modules?: number;
  /** Energy type, e.g. electric or burner */
  type?: string;
  /** Fuel category, e.g. chemical or nuclear */
  category?: string;
  /** Energy consumption in kW */
  usage?: number;
  /** Drain in kW */
  drain?: number | string;
  maintenance1?: number;
  maintenance2?: number;
  maintenance3?: number;
  /** Pollution in #/m */
  pollution?: number;
  mining?: boolean;
  research?: boolean;
  silo?: Silo;
  overclockFactor?: number;
}

export class RationalFactory {
  speed?: Rational;
  modules?: number;
  /** Energy type, e.g. electric or burner */
  type?: string;
  /** Fuel category, e.g. chemical or nuclear */
  category?: string;
  /** Energy consumption in kW */
  usage?: Rational;
  drain?: Rational;
  maintenance1?: Rational;
  maintenance2?: Rational;
  maintenance3?: Rational;
  pollution?: Rational;
  mining?: boolean;
  research?: boolean;
  silo?: RationalSilo;
  overclockFactor?: number;

  constructor(data: Factory) {
    if (data.speed != null) {
      this.speed = Rational.fromNumber(data.speed);
    }
    if (data.modules != null) {
      this.modules = Math.round(data.modules);
    }
    if (data.type) {
      this.type = data.type;
    }
    if (data.category) {
      this.category = data.category;
    }
    if (data.usage != null) {
      this.usage = Rational.fromNumber(data.usage);
    }
    if (data.drain != null) {
      if (typeof data.drain === 'string') {
        this.drain = Rational.fromString(data.drain);
      } else {
        this.drain = Rational.fromNumber(data.drain);
      }
    }
    if (data.maintenance1 != null) {
      this.maintenance1 = Rational.fromNumber(data.maintenance1);
    }    
    if (data.maintenance2 != null) {
      this.maintenance2 = Rational.fromNumber(data.maintenance2);
    }    
    if (data.maintenance3 != null) {
      this.maintenance3 = Rational.fromNumber(data.maintenance3);
    }
    if (data.pollution != null) {
      this.pollution = Rational.fromNumber(data.pollution);
    }
    if (data.mining) {
      this.mining = data.mining;
    }
    if (data.research) {
      this.research = data.research;
    }
    if (data.silo) {
      this.silo = new RationalSilo(data.silo);
    }
    if (data.overclockFactor) {
      this.overclockFactor = data.overclockFactor;
    }
  }
}
