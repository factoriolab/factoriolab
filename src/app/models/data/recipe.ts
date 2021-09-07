import { Rational } from '../rational';
import { Entities } from '../entities';

export interface Recipe {
  id: string;
  name?: string;
  time: number;
  producers: string[];
  in?: Entities<number>;
  out?: Entities<number>;
  expensive?: {
    time?: number;
    in?: Entities<number>;
    out?: Entities<number>;
  };
  cost?: number;
  /** If recipe is a rocket launch, indicates the rocket part recipe used */
  part?: string;
  /** Used to link the item to an alternate icon id */
  icon?: string;
  /** Used to override the factory's usage for this recipe */
  usage?: number;
}

export class RationalRecipe {
  id: string;
  name: string;
  time: Rational;
  producers: string[];
  productivity?: Rational;
  adjustProd?: boolean;
  in?: Entities<Rational>;
  out?: Entities<Rational>;
  expensive?: {
    time?: Rational;
    in?: Entities<Rational>;
    out?: Entities<Rational>;
  };
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
      this.in = Object.keys(data.in).reduce((e: Entities<Rational>, i) => {
        e[i] = Rational.fromNumber(data.in[i]);
        return e;
      }, {});
    }
    if (data.out) {
      this.out = Object.keys(data.out).reduce((e: Entities<Rational>, i) => {
        e[i] = Rational.fromNumber(data.out[i]);
        return e;
      }, {});
    }
    if (data.expensive) {
      this.expensive = {};
      if (data.expensive.time) {
        this.expensive.time = Rational.fromNumber(data.expensive.time);
      }
      if (data.expensive.in) {
        this.expensive.in = Object.keys(data.expensive.in).reduce(
          (e: Entities<Rational>, i) => {
            e[i] = Rational.fromNumber(data.expensive.in[i]);
            return e;
          },
          {}
        );
      }
      if (data.expensive.out) {
        this.expensive.out = Object.keys(data.expensive.out).reduce(
          (e: Entities<Rational>, i) => {
            e[i] = Rational.fromNumber(data.expensive.out[i]);
            return e;
          },
          {}
        );
      }
    }
    if (data.cost) {
      this.cost = Rational.fromNumber(data.cost);
    }
    if (data.part) {
      this.part = data.part;
    }
    if (data.usage != null) {
      this.usage = Rational.fromNumber(data.usage);
    }
  }

  produces(id: string): boolean {
    if (this.out) {
      if (this.out[id]) {
        // Recipe declares this as output, check inputs
        return this.in?.[id] == null || this.in[id].lt(this.out[id]);
      }
      // Recipe declares outputs but not this item
      return false;
    } else if (this.id === id) {
      // Recipe matches item id, check inputs
      return this.in?.[id] == null || this.in[id].lt(Rational.one);
    }
    return false;
  }

  producesOnly(id: string): boolean {
    return Object.keys(this.out).length === 1 && this.produces(id);
  }

  output(id: string): Rational {
    return (this.out?.[id] || Rational.zero).sub(
      this.in?.[id] || Rational.zero
    );
  }
}
