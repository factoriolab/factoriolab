import { createSelector } from '@ngrx/store';

import {
  Column,
  DisplayRateVal,
  Entities,
  Game,
  ItemId,
  MatrixResultType,
  PowerUnit,
  PrecisionColumns,
  RateType,
  Rational,
  RationalProduct,
  Step,
  StepDetail,
  StepDetailTab,
} from '~/models';
import {
  FlowUtility,
  RateUtility,
  RecipeUtility,
  SimplexUtility,
} from '~/utilities';
import { LabState } from '../';
import * as Factories from '../factories';
import * as Items from '../items';
import * as Preferences from '../preferences';
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
export const getBaseProducts = createSelector(
  getIds,
  getEntities,
  Settings.getDataset,
  (ids, entities, data) =>
    ids.map((i) => entities[i]).filter((p) => data.itemEntities[p.itemId])
);

export const getProductSteps = createSelector(
  getBaseProducts,
  Items.getItemSettings,
  Settings.getDisabledRecipeIds,
  Settings.getSimplexModifiers,
  Recipes.getAdjustedDataset,
  (products, itemSettings, disabledRecipeIds, adj, data) =>
    products?.reduce((e: Entities<[string, Rational][]>, p) => {
      e[p.itemId] = SimplexUtility.getSteps(
        p.itemId,
        itemSettings,
        disabledRecipeIds,
        adj.costInput,
        adj.costIgnored,
        data,
        p.rateType === RateType.Factories,
        adj.simplex
      );
      return e;
    }, {})
);

export const getProducts = createSelector(
  getBaseProducts,
  getProductSteps,
  Recipes.getRecipeSettings,
  Factories.getFactories,
  Settings.getDataset,
  (products, productSteps, recipeSettings, factories, data) =>
    products?.map((p) =>
      RecipeUtility.adjustProduct(
        p,
        productSteps,
        recipeSettings,
        factories,
        data
      )
    )
);

export const getProductOptions = createSelector(
  getProducts,
  getProductSteps,
  (products, productSteps) =>
    products.reduce((e: Entities<string[]>, p) => {
      if (productSteps[p.itemId]) {
        e[p.id] = productSteps[p.itemId].map((r) => r[0]);
      }
      return e;
    }, {})
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

export const getProductsByFactories = createSelector(
  getProductsBy,
  (products) => products[RateType.Factories]
);

export const getNormalizedRatesByItems = createSelector(
  getProductsByItems,
  getProductSteps,
  Settings.getDisplayRate,
  (products, productSteps, displayRate) =>
    products?.reduce((e: Entities<Rational>, p) => {
      const rate = p.rate.div(DisplayRateVal[displayRate]);
      if (p.viaId === p.itemId) {
        e[p.id] = rate;
      } else {
        const via = RecipeUtility.getProductStepData(productSteps, p);
        if (via) {
          e[p.id] = rate.div(via[1]);
        } else {
          e[p.id] = Rational.zero;
        }
      }
      return e;
    }, {})
);

export const getNormalizedRatesByBelts = createSelector(
  getProductsByBelts,
  getProductSteps,
  Items.getItemSettings,
  Settings.getBeltSpeed,
  (products, productSteps, itemSettings, beltSpeed) =>
    products?.reduce((e: Entities<Rational>, p) => {
      if (p.viaId === p.itemId) {
        const id = p.viaSetting ?? itemSettings[p.itemId].beltId;
        if (id) {
          e[p.id] = p.rate.mul(beltSpeed[id]);
        }
      } else {
        const via = RecipeUtility.getProductStepData(productSteps, p);
        if (via) {
          const id = p.viaSetting ?? itemSettings[via[0]].beltId;
          if (id) {
            e[p.id] = p.rate.mul(beltSpeed[id]).div(via[1]);
          }
        } else {
          e[p.id] = Rational.zero;
        }
      }
      return e;
    }, {})
);

export const getNormalizedRatesByWagons = createSelector(
  getProductsByWagons,
  getProductSteps,
  Items.getItemSettings,
  Settings.getDisplayRate,
  Settings.getDataset,
  (products, productSteps, itemSettings, displayRate, data) =>
    products?.reduce((e: Entities<Rational>, p) => {
      if (p.viaId === p.itemId) {
        e[p.id] = p.rate.div(DisplayRateVal[displayRate]);
        const wagonId = p.viaSetting ?? itemSettings[p.itemId].wagonId;
        if (wagonId) {
          const item = data.itemEntities[p.itemId];
          const wagon = data.itemEntities[wagonId];
          if (item.stack && wagon.cargoWagon) {
            e[p.id] = e[p.id].mul(item.stack.mul(wagon.cargoWagon.size));
          } else if (wagon.fluidWagon) {
            e[p.id] = e[p.id].mul(wagon.fluidWagon.capacity);
          }
        }
      } else {
        const via = RecipeUtility.getProductStepData(productSteps, p);
        if (via) {
          e[p.id] = p.rate.div(DisplayRateVal[displayRate]);
          const wagonId = p.viaSetting ?? itemSettings[via[0]].wagonId;
          if (wagonId) {
            const item = data.itemEntities[via[0]];
            const wagon = data.itemEntities[wagonId];
            if (item.stack && wagon.cargoWagon) {
              e[p.id] = e[p.id].mul(item.stack.mul(wagon.cargoWagon.size));
            } else if (wagon.fluidWagon) {
              e[p.id] = e[p.id].mul(wagon.fluidWagon.capacity);
            }
          }
          e[p.id] = e[p.id].div(via[1]);
        } else {
          e[p.id] = Rational.zero;
        }
      }
      return e;
    }, {})
);

export const getNormalizedRatesByFactories = createSelector(
  getProductsByFactories,
  getProductSteps,
  Recipes.getRationalRecipeSettings,
  Items.getItemSettings,
  Settings.getAdjustmentData,
  Recipes.getAdjustedDataset,
  (products, productSteps, recipeSettings, itemSettings, adj, data) =>
    products?.reduce((e: Entities<Rational>, p) => {
      let recipeId = data.itemRecipeId[p.itemId];
      if (recipeId && p.viaId === recipeId) {
        const recipe = data.recipeR[recipeId];
        e[p.id] = p.rate.div(recipe.time);
        if (recipe.out) {
          e[p.id] = e[p.id].mul(recipe.out[p.itemId]);
        }
        if (recipe.adjustProd && recipe.productivity) {
          e[p.id] = e[p.id].div(recipe.productivity);
        }
      } else {
        const via = RecipeUtility.getProductStepData(productSteps, p);
        if (via) {
          recipeId = via[0];
          e[p.id] = p.rate.div(via[1]);
        } else {
          e[p.id] = Rational.zero;
        }
      }

      // Adjust based on product recipe settings
      if (recipeId && p.viaSetting) {
        const customSettings = {
          ...recipeSettings,
          ...{
            [recipeId]: {
              ...{
                factoryId: p.viaSetting,
                factoryModuleIds: p.viaFactoryModuleIds,
                beaconCount: p.viaBeaconCount,
                beaconId: p.viaBeaconId,
                beaconModuleIds: p.viaBeaconModuleIds,
                overclock: p.viaOverclock,
              },
            },
          },
        };
        const recipeR = RecipeUtility.adjustRecipes(
          customSettings,
          itemSettings,
          adj.fuelId,
          adj.proliferatorSprayId,
          adj.miningBonus,
          adj.researchSpeed,
          adj.data
        );
        const oldRecipe = data.recipeR[recipeId];
        const newRecipe = recipeR[recipeId];
        const ratio = newRecipe.productivity
          .div(newRecipe.time)
          .div(oldRecipe.productivity)
          .mul(oldRecipe.time);
        e[p.id] = e[p.id].mul(ratio);
      }
      return e;
    }, {})
);

export const getNormalizedRates = createSelector(
  getNormalizedRatesByItems,
  getNormalizedRatesByBelts,
  getNormalizedRatesByWagons,
  getNormalizedRatesByFactories,
  (byItems, byBelts, byWagons, byFactories) => ({
    ...byItems,
    ...byBelts,
    ...byWagons,
    ...byFactories,
  })
);

export const getNormalizedSteps = createSelector(
  getProducts,
  getNormalizedRates,
  Items.getItemSettings,
  Recipes.getAdjustedDataset,
  (products, rates, itemSettings, data) => {
    const steps: Step[] = [];
    for (const product of products) {
      RateUtility.addStepsFor(
        product.itemId,
        rates[product.id],
        steps,
        itemSettings,
        data
      );
    }
    return steps;
  }
);

export const getMatrixResult = createSelector(
  getNormalizedSteps,
  Items.getItemSettings,
  Settings.getDisabledRecipeIds,
  Settings.getSimplexModifiers,
  Recipes.getAdjustedDataset,
  (steps, itemSettings, disabledRecipeIds, adj, data) =>
    adj.simplex
      ? SimplexUtility.solve(
          RateUtility.copy(steps),
          itemSettings,
          disabledRecipeIds,
          adj.costInput,
          adj.costIgnored,
          data
        )
      : { steps, result: MatrixResultType.Skipped }
);

export const getNormalizedStepsWithBelts = createSelector(
  getMatrixResult,
  Items.getItemSettings,
  Recipes.getRecipeSettings,
  Settings.getBeltSpeed,
  Recipes.getAdjustedDataset,
  (result, itemSettings, recipeSettings, beltSpeed, data) =>
    RateUtility.calculateBelts(
      RateUtility.copy(result.steps),
      itemSettings,
      recipeSettings,
      beltSpeed,
      data
    )
);

export const getNormalizedStepsWithOutputs = createSelector(
  getNormalizedStepsWithBelts,
  Recipes.getAdjustedDataset,
  (steps, data) => RateUtility.calculateOutputs(RateUtility.copy(steps), data)
);

export const getNormalizedStepsWithBeacons = createSelector(
  getNormalizedStepsWithOutputs,
  Settings.getRationalBeaconReceivers,
  Recipes.getRationalRecipeSettings,
  Recipes.getAdjustedDataset,
  (steps, beaconReceivers, recipeSettings, data) =>
    RateUtility.calculateBeacons(
      RateUtility.copy(steps),
      beaconReceivers,
      recipeSettings,
      data
    )
);

export const getSteps = createSelector(
  getNormalizedStepsWithBeacons,
  Settings.getDisplayRate,
  (steps, displayRate) =>
    RateUtility.sortHierarchy(
      RateUtility.displayRate(RateUtility.copy(steps), displayRate)
    )
);

export const getSankey = createSelector(
  getSteps,
  Preferences.getLinkSize,
  Preferences.getLinkText,
  Preferences.getLinkPrecision,
  Recipes.getAdjustedDataset,
  (steps, linkSize, linkText, linkPrecision, data) =>
    FlowUtility.buildSankey(
      RateUtility.copy(steps),
      linkSize,
      linkText,
      linkPrecision,
      data
    )
);

export const checkViaState = createSelector(
  getRationalProducts,
  getNormalizedRates,
  (products, rates) => ({ products, rates })
);

export const getZipState = createSelector(
  productsState,
  Items.itemsState,
  Recipes.recipesState,
  Factories.factoriesState,
  Settings.settingsState,
  (products, items, recipes, factories, settings) => ({
    products,
    items,
    recipes,
    factories,
    settings,
  })
);

export const getStepsModified = createSelector(
  getSteps,
  Items.itemsState,
  Recipes.recipesState,
  (steps, itemSettings, recipeSettings) => ({
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
    const beacons: Entities<Rational> = {};
    let power = Rational.zero;
    let pollution = Rational.zero;

    for (const step of steps) {
      if (step.itemId != null) {
        // Total Belts
        if (step.belts?.nonzero()) {
          const belt = itemSettings[step.itemId].beltId;
          if (belt != null) {
            if (!belts.hasOwnProperty(belt)) {
              belts[belt] = Rational.zero;
            }
            belts[belt] = belts[belt].add(step.belts.ceil());
          }
        }

        // Total Wagons
        if (step.wagons?.nonzero()) {
          const wagon = itemSettings[step.itemId].wagonId;
          if (wagon != null) {
            if (!wagons.hasOwnProperty(wagon)) {
              wagons[wagon] = Rational.zero;
            }
            wagons[wagon] = wagons[wagon].add(step.wagons.ceil());
          }
        }
      }

      if (step.recipeId != null) {
        // Total Factories
        if (step.factories?.nonzero()) {
          const recipe = data.recipeEntities[step.recipeId];
          // Don't include silos from launch recipes
          if (!recipe.part) {
            let factory = recipeSettings[step.recipeId].factoryId;
            if (
              data.game === Game.DysonSphereProgram &&
              factory === ItemId.MiningDrill
            ) {
              // Use recipe id (vein type) in place of mining drill for DSP mining
              factory = step.recipeId;
            }
            if (factory != null) {
              if (!factories.hasOwnProperty(factory)) {
                factories[factory] = Rational.zero;
              }
              factories[factory] = factories[factory].add(
                step.factories.ceil()
              );
            }
          }
        }

        // Total Beacons
        if (step.beacons?.nonzero()) {
          const beacon = recipeSettings[step.recipeId].beaconId;
          if (beacon != null) {
            if (!beacons.hasOwnProperty(beacon)) {
              beacons[beacon] = Rational.zero;
            }
            beacons[beacon] = beacons[beacon].add(step.beacons.ceil());
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

    return { belts, wagons, factories, beacons, power, pollution };
  }
);

export const getStepDetails = createSelector(
  getSteps,
  Recipes.getAdjustedDataset,
  Settings.getDisabledRecipeIds,
  (steps, data, disabledRecipeIds) =>
    steps.reduce((e: Entities<StepDetail>, s) => {
      const tabs = [];
      let outputs: Step[] = [];
      const recipeIds: string[] = [];
      const defaultableRecipeIds: string[] = [];
      if (s.itemId != null) {
        const itemId = s.itemId; // Store null-checked id
        tabs.push(StepDetailTab.Item);
        outputs = steps
          .filter((a) => a.outputs?.[itemId] != null)
          .sort((a, b) =>
            b.outputs![itemId].sub(a.outputs![itemId]).toNumber()
          );
      }
      if (s.recipeId != null) {
        tabs.push(StepDetailTab.Recipe);
      }
      if (s.factories?.nonzero()) {
        tabs.push(StepDetailTab.Factory);
      }
      if (s.itemId != null) {
        for (const recipe of data.recipeIds.map((r) => data.recipeR[r])) {
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
        tabs,
        outputs,
        recipeIds,
        defaultableRecipeIds,
      };

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
    if (step.recipeId) {
      indents[step.recipeId] = indent.length;
    }
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

    for (const i of PrecisionColumns.filter((i) => columns[i].show)) {
      effPrecision[i] = effPrecFrom(steps, columns[i].precision, (s) =>
        i === Column.Items
          ? (s.items || Rational.zero).sub(s.surplus || Rational.zero)
          : (s as Record<string, any>)[i.toLowerCase()]
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
