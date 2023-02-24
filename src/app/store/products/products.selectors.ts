import { createSelector } from '@ngrx/store';

import { fnPropsNotNullish } from '~/helpers';
import {
  Column,
  Entities,
  Game,
  ItemId,
  PowerUnit,
  precisionColumns,
  RateType,
  Rational,
  RationalProduct,
  Step,
  StepDetail,
  StepDetailTab,
  StepOutput,
} from '~/models';
import { RateUtility, SimplexUtility } from '~/utilities';
import { LabState } from '../';
import * as Factories from '../factories';
import * as Items from '../items';
import * as Preferences from '../preferences';
import * as Producers from '../producers';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import { ProductsState } from './products.reducer';

/* Base selector functions */
export const productsState = (state: LabState): ProductsState =>
  state.productsState;

export const getIds = createSelector(productsState, (state) => state.ids);
export const getEntities = createSelector(
  productsState,
  (state) => state.entities
);

/* Complex selectors */
export const getProducts = createSelector(
  getIds,
  getEntities,
  Settings.getDataset,
  (ids, entities, data) =>
    ids.map((i) => entities[i]).filter((p) => data.itemEntities[p.itemId])
);

export const getRationalProducts = createSelector(getProducts, (products) =>
  products.map((p) => new RationalProduct(p))
);

export const getProductsBy = createSelector(getRationalProducts, (products) =>
  products.reduce((e: Entities<RationalProduct[]>, p) => {
    if (!e[p.rateType]) {
      e[p.rateType] = [];
    }
    e[p.rateType] = [...e[p.rateType], p];
    return e;
  }, {})
);

export const getProductsByItems = createSelector(
  getProductsBy,
  (products) => products[RateType.Items]
);

export const getProductsByBelts = createSelector(
  getProductsBy,
  (products) => products[RateType.Belts]
);

export const getProductsByWagons = createSelector(
  getProductsBy,
  (products) => products[RateType.Wagons]
);

export const getNormalizedRatesByItems = createSelector(
  getProductsByItems,
  Settings.getDisplayRateInfo,
  (products, dispRateInfo) =>
    products?.reduce((e: Entities<Rational>, p) => {
      const rate = p.rate.div(dispRateInfo.value);
      e[p.id] = rate;
      return e;
    }, {})
);

export const getNormalizedRatesByBelts = createSelector(
  getProductsByBelts,
  Items.getItemSettings,
  Settings.getBeltSpeed,
  (products, itemSettings, beltSpeed) =>
    products?.reduce((e: Entities<Rational>, p) => {
      const id = itemSettings[p.itemId].beltId;
      if (id) {
        e[p.id] = p.rate.mul(beltSpeed[id]);
      }
      return e;
    }, {})
);

export const getNormalizedRatesByWagons = createSelector(
  getProductsByWagons,
  Items.getItemSettings,
  Settings.getDisplayRateInfo,
  Settings.getDataset,
  (products, itemSettings, dispRateInfo, data) =>
    products?.reduce((e: Entities<Rational>, p) => {
      e[p.id] = p.rate.div(dispRateInfo.value);
      const wagonId = itemSettings[p.itemId].wagonId;
      if (wagonId) {
        const item = data.itemEntities[p.itemId];
        const wagon = data.itemEntities[wagonId];
        if (item.stack && wagon.cargoWagon) {
          e[p.id] = e[p.id].mul(item.stack.mul(wagon.cargoWagon.size));
        } else if (wagon.fluidWagon) {
          e[p.id] = e[p.id].mul(wagon.fluidWagon.capacity);
        }
      }
      return e;
    }, {})
);

export const getNormalizedRates = createSelector(
  getNormalizedRatesByItems,
  getNormalizedRatesByBelts,
  getNormalizedRatesByWagons,
  (byItems, byBelts, byWagons) => ({
    ...byItems,
    ...byBelts,
    ...byWagons,
  })
);

export const getNormalizedProducts = createSelector(
  getRationalProducts,
  getNormalizedRates,
  (products, rates) => products.map((p) => ({ ...p, ...{ rate: rates[p.id] } }))
);

export const getMatrixResult = createSelector(
  getNormalizedProducts,
  Producers.getRationalProducers,
  Items.getItemSettings,
  Settings.getDisabledRecipeIds,
  Settings.getSimplexModifiers,
  Recipes.getAdjustedDataset,
  (products, producers, itemSettings, disabledRecipeIds, adj, data) =>
    SimplexUtility.solve(
      products,
      producers,
      itemSettings,
      disabledRecipeIds,
      adj.costInput,
      adj.costIgnored,
      adj.simplexType,
      data
    )
);

export const getSteps = createSelector(
  getMatrixResult,
  Producers.getRationalProducers,
  Items.getItemSettings,
  Recipes.getRationalRecipeSettings,
  Settings.getRationalBeaconReceivers,
  Settings.getBeltSpeed,
  Settings.getDisplayRateInfo,
  Recipes.getAdjustedDataset,
  (
    result,
    producers,
    itemSettings,
    recipeSettings,
    beaconReceivers,
    beltSpeed,
    dispRateInfo,
    data
  ) =>
    RateUtility.normalizeSteps(
      result.steps,
      producers,
      itemSettings,
      recipeSettings,
      beaconReceivers,
      beltSpeed,
      dispRateInfo,
      data
    )
);

export const getZipState = createSelector(
  productsState,
  Producers.producersState,
  Items.itemsState,
  Recipes.recipesState,
  Factories.factoriesState,
  Settings.settingsState,
  (products, producers, items, recipes, factories, settings) => ({
    products,
    producers,
    items,
    recipes,
    factories,
    settings,
  })
);

export const getStepsModified = createSelector(
  getSteps,
  Producers.getBaseProducers,
  Items.itemsState,
  Recipes.recipesState,
  (steps, producers, itemSettings, recipeSettings) => ({
    producers: producers.reduce((e: Entities<boolean>, p) => {
      e[p.id] =
        p.factoryId != null ||
        p.factoryModuleIds != null ||
        p.beacons != null ||
        p.overclock != null;
      return e;
    }, {}),
    items: steps.reduce((e: Entities<boolean>, s) => {
      if (s.itemId) {
        e[s.itemId] = itemSettings[s.itemId] != null;
      }
      return e;
    }, {}),
    recipes: steps.reduce((e: Entities<boolean>, s) => {
      if (s.recipeId) {
        e[s.recipeId] = recipeSettings[s.recipeId] != null;
      }
      return e;
    }, {}),
  })
);

export const getTotals = createSelector(
  getSteps,
  Items.getItemSettings,
  Recipes.getRecipeSettings,
  Recipes.getAdjustedDataset,
  (steps, itemSettings, recipeSettings, data) => {
    const belts: Entities<Rational> = {};
    const wagons: Entities<Rational> = {};
    const factories: Entities<Rational> = {};
    const factoryModules: Entities<Rational> = {};
    const beacons: Entities<Rational> = {};
    const beaconModules: Entities<Rational> = {};
    let power = Rational.zero;
    let pollution = Rational.zero;

    for (const step of steps) {
      if (step.itemId != null) {
        // Total Belts
        if (step.belts?.nonzero()) {
          const belt = itemSettings[step.itemId].beltId;
          if (belt != null) {
            if (!Object.prototype.hasOwnProperty.call(belts, belt)) {
              belts[belt] = Rational.zero;
            }
            belts[belt] = belts[belt].add(step.belts.ceil());
          }
        }

        // Total Wagons
        if (step.wagons?.nonzero()) {
          const wagon = itemSettings[step.itemId].wagonId;
          if (wagon != null) {
            if (!Object.prototype.hasOwnProperty.call(wagons, wagon)) {
              wagons[wagon] = Rational.zero;
            }
            wagons[wagon] = wagons[wagon].add(step.wagons.ceil());
          }
        }
      }

      if (step.recipeId != null) {
        // Total Factories & Modules
        if (step.factories?.nonzero()) {
          const recipe = data.recipeEntities[step.recipeId];
          // Don't include silos from launch recipes
          if (!recipe.part) {
            const settings = recipeSettings[step.recipeId];
            let factory = settings.factoryId;
            if (
              data.game === Game.DysonSphereProgram &&
              factory === ItemId.MiningDrill
            ) {
              // Use recipe id (vein type) in place of mining drill for DSP mining
              factory = step.recipeId;
            }
            if (factory != null) {
              if (!Object.prototype.hasOwnProperty.call(factories, factory)) {
                factories[factory] = Rational.zero;
              }

              const value = step.factories.ceil();
              factories[factory] = factories[factory].add(value);

              // Check for modules to add
              if (settings.factoryModuleIds) {
                addValueToRecordByIds(
                  factoryModules,
                  settings.factoryModuleIds.filter((i) => i !== ItemId.Module),
                  value
                );
              }
            }
          }
        }

        // Total Beacons
        const stepBeacons = step.recipeSettings?.beacons;
        if (stepBeacons != null) {
          for (const beacon of stepBeacons) {
            const beaconId = beacon.id;
            const total = beacon.total;

            if (beaconId == null || !total?.nonzero()) continue;

            if (!Object.prototype.hasOwnProperty.call(beacons, beaconId)) {
              beacons[beaconId] = Rational.zero;
            }

            const value = total.ceil();
            beacons[beaconId] = beacons[beaconId].add(value);

            // Check for modules to add
            if (beacon.moduleIds != null) {
              addValueToRecordByIds(
                beaconModules,
                beacon.moduleIds.filter((i) => i !== ItemId.Module),
                value
              );
            }
          }
        }
      }

      // Total Power
      if (step.power != null) {
        power = power.add(step.power);
      }

      // Total Pollution
      if (step.pollution != null) {
        pollution = pollution.add(step.pollution);
      }
    }

    return {
      belts,
      wagons,
      factories,
      factoryModules,
      beacons,
      beaconModules,
      power,
      pollution,
    };
  }
);

function addValueToRecordByIds(
  record: Entities<Rational>,
  ids: string[],
  value: Rational
): void {
  ids.forEach((id) => {
    if (!Object.prototype.hasOwnProperty.call(record, id)) {
      record[id] = Rational.zero;
    }

    record[id] = record[id].add(value);
  });
}

export const getStepDetails = createSelector(
  getSteps,
  Recipes.getAdjustedDataset,
  Settings.getDisabledRecipeIds,
  (steps, data, disabledRecipeIds) =>
    steps.reduce((e: Entities<StepDetail>, s) => {
      const tabs: StepDetailTab[] = [];
      const outputs: StepOutput[] = [];
      const recipeIds: string[] = [];
      const defaultableRecipeIds: string[] = [];
      if (s.itemId != null && s.items != null) {
        const itemId = s.itemId; // Store null-checked id
        tabs.push(StepDetailTab.Item);
        outputs.push(
          ...steps
            .filter(fnPropsNotNullish('outputs', 'recipeId', 'factories'))
            .filter((s) => s.outputs[itemId] != null)
            .map((s) => ({
              recipeId: s.recipeId,
              producerId: s.producerId,
              value: s.outputs[itemId],
              factories: s.factories,
            }))
        );
        outputs.sort((a, b) => b.value.sub(a.value).toNumber());
      }
      if (s.recipeId != null) {
        tabs.push(StepDetailTab.Recipe);
      }
      if (s.factories?.nonzero()) {
        tabs.push(StepDetailTab.Factory);
      }
      if (s.itemId != null) {
        for (const recipe of data.complexRecipeIds.map(
          (r) => data.recipeR[r]
        )) {
          if (recipe.produces(s.itemId)) {
            recipeIds.push(recipe.id);
            if (
              disabledRecipeIds.indexOf(recipe.id) === -1 &&
              recipe.producesOnly(s.itemId)
            ) {
              defaultableRecipeIds.push(recipe.id);
            }
          }
        }
        if (recipeIds.length) {
          tabs.push(StepDetailTab.Recipes);
        }
      }

      e[s.id] = {
        tabs: tabs.map((t) => ({
          id: `step_${s.id}_${t}_tab`,
          label: t,
          url: `#step_${s.id}_${t}`,
          target: '_self',
        })),
        outputs,
        recipeIds,
        defaultableRecipeIds,
      };

      return e;
    }, {})
);

export const getStepById = createSelector(getSteps, (steps) =>
  steps.reduce((e: Entities<Step>, s) => {
    e[s.id] = s;
    return e;
  }, {})
);

export const getStepByItemEntities = createSelector(getSteps, (steps) =>
  steps.reduce((e: Entities<Step>, s) => {
    if (s.itemId != null) {
      e[s.itemId] = s;
    }
    return e;
  }, {})
);

export const getStepTree = createSelector(getSteps, (steps) => {
  const tree: Entities<boolean[]> = {};
  const indents: Entities<number> = {};
  for (const step of steps) {
    let indent: boolean[] = [];
    if (step.parents) {
      const keys = Object.keys(step.parents);
      if (keys.length === 1 && indents[keys[0]] != null) {
        indent = new Array(indents[keys[0]] + 1).fill(false);
      }
    }
    indents[step.id] = indent.length;
    tree[step.id] = indent;
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (tree[step.id].length) {
      for (let j = i + 1; j < steps.length; j++) {
        const next = steps[j];
        if (tree[next.id]) {
          if (tree[next.id].length === tree[step.id].length) {
            for (let k = i; k < j; k++) {
              const trail = steps[k];
              if (tree[trail.id]) {
                tree[trail.id][tree[step.id].length - 1] = true;
              }
            }
            break;
          } else if (tree[next.id].length < tree[step.id].length) {
            break;
          }
        }
      }
    }
  }

  return tree;
});

export const getEffectivePrecision = createSelector(
  getSteps,
  Settings.getColumnsState,
  (steps, columns) => {
    const effPrecision: Entities<number | null> = {};
    effPrecision[Column.Surplus] = effPrecFrom(
      steps,
      columns[Column.Items].precision,
      (s) => s.surplus
    );

    for (const i of precisionColumns.filter((i) => columns[i].show)) {
      effPrecision[i] = effPrecFrom(steps, columns[i].precision, (s) =>
        i === Column.Items
          ? (s.items || Rational.zero).sub(s.surplus || Rational.zero)
          : s[
              i.toLowerCase() as
                | 'items'
                | 'belts'
                | 'wagons'
                | 'factories'
                | 'power'
                | 'pollution'
            ]
      );
    }

    return effPrecision;
  }
);

export const getEffectivePowerUnit = createSelector(
  getSteps,
  Preferences.getPowerUnit,
  (steps, powerUnit) => {
    if (powerUnit === PowerUnit.Auto) {
      let minPower: Rational | undefined;
      for (const step of steps) {
        if (step.power != null) {
          if (minPower == null || step.power.lt(minPower)) {
            minPower = step.power;
          }
        }
      }
      minPower = minPower ?? Rational.zero;
      if (minPower.lt(Rational.thousand)) {
        return PowerUnit.kW;
      } else if (minPower.lt(Rational.million)) {
        return PowerUnit.MW;
      } else {
        return PowerUnit.GW;
      }
    } else {
      return powerUnit;
    }
  }
);

export function effPrecFrom(
  steps: Step[],
  precision: number | null,
  fn: (step: Step) => Rational | undefined
): number | null {
  if (precision == null) {
    return precision;
  }
  let max = 0;
  for (const step of steps) {
    const dec = fn(step)?.toDecimals() ?? 0;
    if (dec >= precision) {
      return precision;
    } else if (dec > max) {
      max = dec;
    }
  }
  return max;
}
