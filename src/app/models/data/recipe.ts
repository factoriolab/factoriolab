import { Entities } from '../entities';
import { Rational } from '../rational';

export interface Recipe {
  id: string;
  name: string;
  time: number;
  producers: string[];
  in?: Entities<number>;
  out?: Entities<number>;
  cost?: number;
  /** If recipe is a rocket launch, indicates the rocket part recipe used */
  part?: string;
  /** Used to link the item to an alternate icon id */
  icon?: string;
  /** Used to override the factory's usage for this recipe */
  usage?: number | string;
}

export class RationalRecipe {
  id: string;
  name: string;
  time: Rational;
  producers: string[];
  productivity = Rational.one;
  adjustProd = false;
  in: Entities<Rational>;
  out: Entities<Rational>;
  cost?: Rational;
  /** If recipe is a rocket launch, indicates the rocket part recipe used */
  part?: string;
  usage?: Rational;
  drain?: Rational;
  consumption?: Rational;
  pollution?: Rational;

  constructor(data: Recipe) {
    this.id = data.id;
    this.name = data.name;
    this.time = Rational.fromNumber(data.time);
    this.producers = data.producers;
    if (data.in) {
      const inputs = data.in;
      this.in = Object.keys(inputs).reduce((e: Entities<Rational>, i) => {
        e[i] = Rational.fromNumber(inputs[i]);
        return e;
      }, {});
    } else {
      this.in = {};
    }
    if (data.out) {
      const outputs = data.out;
      this.out = Object.keys(outputs).reduce((e: Entities<Rational>, i) => {
        e[i] = Rational.fromNumber(outputs[i]);
        return e;
      }, {});
    } else {
      this.out = { [data.id]: Rational.one };
    }
    if (data.cost) {
      this.cost = Rational.fromNumber(data.cost);
    }
    if (data.part) {
      this.part = data.part;
    }
    if (data.usage != null) {
      if (typeof data.usage === 'string') {
        this.usage = Rational.fromString(data.usage);
      } else {
        this.usage = Rational.fromNumber(data.usage);
      }
    }
  }

  produces(id: string): boolean {
    if (this.out[id]) {
      // Recipe declares this as output, check inputs
      return this.in[id] == null || this.in[id].lt(this.out[id]);
    }
    return false;
  }

  producesOnly(id: string): boolean {
    return Object.keys(this.out).length === 1 && this.produces(id);
  }

  output(id: string): Rational {
    return (this.out[id] ?? Rational.zero).sub(this.in[id] ?? Rational.zero);
  }
}
