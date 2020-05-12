import Fraction from 'fraction.js';

import { ItemId, Recipe, Step, RecipeId, Entities, Factors } from '~/models';
import { DatasetState } from '~/store/dataset';
import { RecipeState } from '~/store/recipe';
import { RateUtility } from './rate';

interface ProductionData {
  recipe: Recipe;
  u238: Fraction;
  u235: Fraction;
}

interface ConversionData {
  recipe: Recipe;
  input: Fraction;
  output: Fraction;
  factories: Fraction;
  max: Fraction;
}

export interface UraniumMatrix {
  prod: ProductionData;
  conv: ConversionData;
}

interface UraniumSteps {
  u238: Step;
  u235: Step;
}

export class UraniumUtility {
  static URANIUM_ITEM = [ItemId.Uranium235, ItemId.Uranium238];

  /** Calculate data for uranium processing recipe */
  static getProductionData(
    factors: Entities<Factors>,
    data: DatasetState
  ): ProductionData {
    const recipe = data.recipeEntities[RecipeId.UraniumProcessing];
    const f = factors[RecipeId.UraniumProcessing];

    return {
      recipe,
      u238: new Fraction(recipe.out[ItemId.Uranium238]).mul(f.prod),
      u235: new Fraction(recipe.out[ItemId.Uranium235]).mul(f.prod),
    };
  }

  /** Calculate data for kovarex enrichment recipe */
  static getConversionData(
    consumes: Fraction,
    base: Fraction,
    factors: Entities<Factors>,
    data: DatasetState
  ): ConversionData {
    const recipe = data.recipeEntities[RecipeId.KovarexEnrichmentProcess];
    const f = factors[RecipeId.KovarexEnrichmentProcess];
    const input = new Fraction(recipe.in[ItemId.Uranium238]).sub(
      recipe.out[ItemId.Uranium238]
    );
    const output = new Fraction(recipe.out[ItemId.Uranium235])
      .sub(recipe.in[ItemId.Uranium235])
      .mul(f.prod);
    const factories = consumes.div(input);
    const max = base.add(factories.mul(output));

    return {
      recipe,
      input,
      output,
      factories,
      max,
    };
  }

  /** Find and calculate matrix for uranium recipes */
  static getMatrix(
    factors: Entities<Factors>,
    data: DatasetState
  ): UraniumMatrix {
    const prod = this.getProductionData(factors, data);
    const conv = this.getConversionData(prod.u238, prod.u235, factors, data);

    return { prod, conv };
  }

  /** Find or create a specific uranium step */
  static getStep(
    itemId: ItemId,
    recipeId: RecipeId,
    steps: Step[],
    settings: RecipeState
  ) {
    let step = steps.find((s) => s.itemId === itemId);
    if (!step) {
      step = {
        itemId,
        recipeId,
        items: new Fraction(0),
        factories: new Fraction(0),
        settings: settings[recipeId],
      };

      steps.push(step);
    } else {
      step.settings = settings[recipeId];
      step.recipeId = recipeId;
    }
    step.surplus = new Fraction(0);

    return step;
  }

  /** Find or create uranium steps */
  static getSteps(
    steps: Step[],
    matrix: UraniumMatrix,
    settings: RecipeState
  ): UraniumSteps {
    const u238 = this.getStep(
      ItemId.Uranium238,
      matrix.prod.recipe.id,
      steps,
      settings
    );
    const u235 = this.getStep(
      ItemId.Uranium235,
      matrix.conv.recipe.id,
      steps,
      settings
    );

    return { u235, u238 };
  }

  /** Calculate number of centrifuges required for u238, surplus u235 */
  static calculateUranium238(
    step: UraniumSteps,
    matrix: UraniumMatrix
  ): UraniumSteps {
    if (step.u238.items.n > 0) {
      // Centrifuges required for u238
      const centrifuges = step.u238.items.div(matrix.prod.u238);

      // Surplus u235
      step.u235.surplus = centrifuges.mul(matrix.prod.u235);

      step.u238.factories = centrifuges;
    }

    return step;
  }

  /** Calculate number of centrifuges and enrichment centrifuges required for u235 */
  static calculateUranium235(
    step: UraniumSteps,
    matrix: UraniumMatrix
  ): UraniumSteps {
    if (step.u235.items.n > 0) {
      if (step.u235.surplus >= step.u235.items) {
        // Already producing enough u235, subtract from surplus
        step.u235.surplus = step.u235.surplus.sub(step.u235.items);
      } else {
        // Subtract any surplus from what is required
        const required = step.u235.items.sub(step.u235.surplus);
        step.u235.surplus = new Fraction(0);
        // Centrifuges required for u235
        const centrifuges = required.div(matrix.conv.max);
        // Enrichment centrifuges required for u235
        const enrichment = centrifuges.mul(matrix.conv.factories);

        step.u238.factories = step.u238.factories.add(centrifuges);
        step.u235.factories = step.u235.factories.add(enrichment);
      }
    }

    return step;
  }

  /** Calculate number of items output via uranium processes */
  static calculateItems(
    step: UraniumSteps,
    matrix: UraniumMatrix
  ): UraniumSteps {
    // 1) From production
    step.u238.items = step.u238.factories.mul(matrix.prod.u238);
    step.u235.items = step.u238.factories.mul(matrix.prod.u235);
    // 2) From enrichment
    /**
     * Note: It seems as though the Kirk McDonald calculator calculates
     * the number of items by multiplying recipe output by productivity,
     * but this is incorrect. Productivity only affects the difference
     * between input and output, so total items is actually:
     * (difference * productivity) + input
     */
    step.u235.items = step.u235.items.add(
      step.u235.factories.mul(
        matrix.conv.output.add(matrix.conv.recipe.in[ItemId.Uranium235])
      )
    );
    step.u238.items = step.u238.items.add(
      step.u235.factories.mul(matrix.conv.recipe.out[ItemId.Uranium238])
    );

    return step;
  }

  /** Calculate inputs (uranium ore) */
  static calculateInputs(
    step: UraniumSteps,
    matrix: UraniumMatrix,
    steps: Step[],
    settings: RecipeState,
    factors: Entities<Factors>,
    belt: ItemId,
    fuel: ItemId,
    oilRecipe: RecipeId,
    data: DatasetState
  ): UraniumSteps {
    RateUtility.addStepsFor(
      ItemId.UraniumOre,
      step.u238.factories.mul(matrix.prod.recipe.in[ItemId.UraniumOre]),
      steps,
      settings,
      factors,
      belt,
      fuel,
      oilRecipe,
      data
    );

    return step;
  }

  /** Scale out factories based on speed factors */
  static calculateFactories(
    step: UraniumSteps,
    matrix: UraniumMatrix,
    factors: Entities<Factors>
  ): UraniumSteps {
    step.u238.factories = step.u238.factories
      .mul(matrix.prod.recipe.time)
      .div(factors[matrix.prod.recipe.id].speed);
    step.u235.factories = step.u235.factories
      .mul(matrix.conv.recipe.time)
      .div(factors[matrix.conv.recipe.id].speed);

    return step;
  }

  /** Calculate and add steps for required uranium processing */
  static addSteps(
    steps: Step[],
    settings: RecipeState,
    factors: Entities<Factors>,
    belt: ItemId,
    fuel: ItemId,
    oilRecipe: RecipeId,
    data: DatasetState
  ): Step[] {
    if (steps.every((s) => this.URANIUM_ITEM.indexOf(s.itemId) === -1)) {
      // No matching uranium products found in steps
      return steps;
    }

    const matrix = this.getMatrix(factors, data);
    let step = this.getSteps(steps, matrix, settings);
    step = this.calculateUranium238(step, matrix);
    step = this.calculateUranium235(step, matrix);
    step = this.calculateItems(step, matrix);
    step = this.calculateInputs(
      step,
      matrix,
      steps,
      settings,
      factors,
      belt,
      fuel,
      oilRecipe,
      data
    );
    step = this.calculateFactories(step, matrix, factors);

    return steps;
  }
}
