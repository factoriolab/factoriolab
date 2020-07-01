import { Rational } from '../rational';
import { Entities } from '../entities';

export enum RecipeId {
  AdvancedOilProcessing = 'advanced-oil-processing',
  BasicOilProcessing = 'basic-oil-processing',
  CoalLiquefaction = 'coal-liquefaction',
  CopperCable = 'copper-cable',
  ElectronicCircuit = 'electronic-circuit',
  HeavyOilCracking = 'heavy-oil-cracking',
  IronOre = 'iron-ore',
  KovarexEnrichmentProcess = 'kovarex-enrichment-process',
  LightOilCracking = 'light-oil-cracking',
  MiningProductivity = 'mining-productivity',
  PlasticBar = 'plastic-bar',
  RocketPart = 'rocket-part',
  Satellite = 'satellite',
  SolidFuelFromHeavyOil = 'solid-fuel-from-heavy-oil',
  SolidFuelFromLightOil = 'solid-fuel-from-light-oil',
  SolidFuelFromPetroleumGas = 'solid-fuel-from-petroleum-gas',
  SpaceSciencePack = 'space-science-pack',
  SteelChest = 'steel-chest',
  UraniumProcessing = 'uranium-processing',
}

export interface Recipe {
  id: RecipeId;
  name: string;
  time: number;
  in?: Entities<number>;
  out?: Entities<number>;
  expensive?: {
    time?: number;
    in?: Entities<number>;
  };
  producers?: string[];
}

export class RationalRecipe {
  id: RecipeId;
  name: string;
  time: Rational;
  adjustProd?: Rational;
  in?: Entities<Rational>;
  out?: Entities<Rational>;
  expensive?: {
    time?: Rational;
    in?: Entities<Rational>;
  };
  producers?: string[];

  constructor(data: Recipe) {
    this.id = data.id;
    this.name = data.name;
    this.time = Rational.fromNumber(data.time);
    if (data.in) {
      this.in = Object.keys(data.in).reduce((e: Entities<Rational>, i) => {
        return { ...e, ...{ [i]: Rational.fromNumber(data.in[i]) } };
      }, {});
    }
    if (data.out) {
      this.out = Object.keys(data.out).reduce((e: Entities<Rational>, i) => {
        return { ...e, ...{ [i]: Rational.fromNumber(data.out[i]) } };
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
            return {
              ...e,
              ...{ [i]: Rational.fromNumber(data.expensive.in[i]) },
            };
          },
          {}
        );
      }
    }
    this.producers = data.producers;
  }
}
