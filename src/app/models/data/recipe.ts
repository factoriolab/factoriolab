import { Entities } from '../entities';
import { Rational } from '../rational';

export interface Recipe {
  id: string;
  name: string;
  category: string;
  row: number;
  time: number | string;
  producers: string[];
  in: Entities<number | string>;
  out: Entities<number | string>;
  /** Denotes amount of output that is not affected by productivity */
  catalyst?: Entities<number | string>;
  cost?: number | string;
  /** If recipe is a rocket launch, indicates the rocket part recipe used */
  part?: string;
  /** If a recipe is locked initially, indicates what technology is required */
  unlockedBy?: string;
  isMining?: boolean;
  isTechnology?: boolean;
  isBurn?: boolean;
  /** Used to link the recipe to an alternate icon id */
  icon?: string;
  /** Used to add extra text to an already defined icon */
  iconText?: string;
  /** Used to override the machine's usage for this recipe */
  usage?: number | string;
}

export class RecipeRational {
  id: string;
  name: string;
  category: string;
  row: number;
  time: Rational;
  producers: string[];
  productivity = Rational.one;
  in: Entities<Rational>;
  out: Entities<Rational>;
  /** Denotes amount of output that is not affected by productivity */
  catalyst?: Entities<Rational>;
  cost?: Rational;
  /** If recipe is a rocket launch, indicates the rocket part recipe used */
  part?: string;
  /** If a recipe is locked initially, indicates what technology unlocks it */
  unlockedBy?: string;
  isMining?: boolean;
  isTechnology?: boolean;
  isBurn?: boolean;
  /** Used to link the recipe to an alternate icon id */
  icon?: string;
  /** Used to add extra text to an already defined icon */
  iconText?: string;
  usage?: Rational;
  drain?: Rational;
  consumption?: Rational;
  pollution?: Rational;

  produces: Set<string> = new Set();
  output: Entities<Rational> = {};

  constructor(obj: Recipe) {
    this.id = obj.id;
    this.name = obj.name;
    this.category = obj.category;
    this.row = Math.round(obj.row);
    this.time = Rational.from(obj.time);
    this.producers = obj.producers;

    this.in = Object.keys(obj.in).reduce((e: Entities<Rational>, i) => {
      e[i] = Rational.from(obj.in[i]);
      return e;
    }, {});

    this.out = Object.keys(obj.out).reduce((e: Entities<Rational>, i) => {
      e[i] = Rational.from(obj.out[i]);
      return e;
    }, {});

    if (obj.catalyst) {
      const catalyst = obj.catalyst; // Store null-checked value
      this.catalyst = Object.keys(catalyst).reduce(
        (e: Entities<Rational>, i) => {
          e[i] = Rational.from(catalyst[i]);
          return e;
        },
        {},
      );
    }

    if (obj.cost) {
      this.cost = Rational.from(obj.cost);
    }

    this.part = obj.part;
    this.isMining = obj.isMining;
    this.isTechnology = obj.isTechnology;
    this.isBurn = obj.isBurn;
    this.icon = obj.icon;
    this.iconText = obj.iconText;

    if (obj.usage != null) {
      this.usage = Rational.from(obj.usage);
    }
  }

  finalize(): void {
    for (const outId of Object.keys(this.out)) {
      const output = this.out[outId];
      if (this.in[outId] == null || this.in[outId].lt(output)) {
        this.produces.add(outId);
      }

      this.output[outId] = output
        .sub(this.in[outId] ?? Rational.zero)
        .div(this.time);
    }

    for (const inId of Object.keys(this.in).filter(
      (i) => this.out[i] == null,
    )) {
      const input = this.in[inId];
      this.output[inId] = input.inverse().div(this.time);
    }
  }
}
