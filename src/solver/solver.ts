import { Injectable } from '@angular/core';
import {
  Constraint,
  ConstraintProperties,
  Model,
  Simplex,
  Status,
  Variable,
  VariableProperties,
} from 'glpk-ts';

import { AdjustedRecipe, Recipe } from '~/data/schema/recipe';
import { Rational, rational } from '~/models/rational';
import {
  isRecipeObjective,
  ObjectiveState,
  RecipeObjective,
} from '~/state/objectives/objective';
import { ObjectiveType } from '~/state/objectives/objective-type';
import {
  CostKey,
  FACTORIO_FLUID_COST_RATIO,
} from '~/state/settings/cost-settings';
import { AdjustedDataset, Dataset } from '~/state/settings/dataset';
import { MaximizeType } from '~/state/settings/maximize-type';
import { Settings } from '~/state/settings/settings';
import { spread } from '~/utils/object';
import { contains } from '~/utils/record';

import { GlpkResult } from './glpk-result';
import { ItemValues } from './item-values';
import { simplexConfig } from './simplex-config';
import { SimplexResult } from './simplex-result';
import { SimplexSolution } from './simplex-solution';
import { SimplexState } from './simplex-state';
import { Step } from './step';

@Injectable({ providedIn: 'root' })
export class Solver {
  solve(
    objectives: ObjectiveState[],
    settings: Settings,
    data: AdjustedDataset,
    paused: boolean,
  ): SimplexResult {
    if (paused) return { steps: [], resultType: 'paused' };

    if (objectives.length === 0) return { steps: [], resultType: 'skipped' };

    // Get matrix state
    const state = this.getState(objectives, settings, data);

    // Get solution for matrix state
    const solution = this.getSolution(state);

    if (solution.resultType === 'solved') {
      // Update steps with solution
      this.updateSteps(solution, state);
    }

    return {
      steps: state.steps,
      resultType: solution.resultType,
      returnCode: solution.returnCode,
      simplexStatus: solution.simplexStatus,
      unboundedRecipeId: solution.unboundedRecipeId,
      time: solution.time,
      cost: solution.cost,
    };
  }

  private addItemValue(
    obj: Record<string, ItemValues>,
    id: string,
    value = rational.zero,
    key: keyof ItemValues = 'out',
  ): void {
    if (obj[id]) {
      const current = obj[id][key];
      if (current) obj[id][key] = current.add(value);
      else obj[id][key] = value;
    } else obj[id] = { ...{ out: rational.zero }, [key]: value };
  }

  //#region Setup
  private getState(
    objectives: ObjectiveState[],
    settings: Settings,
    data: AdjustedDataset,
  ): SimplexState {
    // Set up state object
    const state: SimplexState = {
      objectives,
      recipeObjectives: objectives.filter(
        (o): o is RecipeObjective =>
          isRecipeObjective(o) &&
          [ObjectiveType.Output, ObjectiveType.Maximize].includes(o.type),
      ),
      steps: [],
      recipes: {},
      itemValues: {},
      recipeLimits: {},
      unproduceableIds: new Set(),
      excludedIds: settings.excludedItemIds,
      itemIds: data.itemIds.filter((i) => !settings.excludedItemIds.has(i)),
      maximizeType: settings.maximizeType,
      requireMachinesOutput: settings.requireMachinesOutput,
      costs: settings.costs,
      data,
      hasSurplusCost: settings.costs.surplus.gt(rational.zero),
    };

    // Add item objectives to matrix state
    for (const obj of objectives) {
      if (isRecipeObjective(obj)) {
        switch (obj.type) {
          case ObjectiveType.Output:
          case ObjectiveType.Maximize: {
            for (const itemId of Object.keys(obj.recipe.out)) {
              this.addItemValue(state.itemValues, itemId);
              this.parseItemRecursively(itemId, state);
            }

            this.parseRecipeRecursively(obj.recipe, state);

            break;
          }
          case ObjectiveType.Input: {
            // Parse inputs and add them as though they were item objective inputs
            for (const itemId of Object.keys(obj.recipe.out).filter((i) =>
              obj.recipe.produces.has(i),
            )) {
              const rate = obj.value.mul(obj.recipe.output[itemId]);
              this.addItemValue(state.itemValues, itemId, rate, 'in');
            }
            break;
          }
          case ObjectiveType.Limit: {
            /**
             * Add recipe objective count to recipe limits if current limit is
             * null or greater than this objective's value
             */
            const current = state.recipeLimits[obj.targetId];
            if (current == null || current.gt(obj.value)) {
              state.recipeLimits[obj.targetId] = obj.value;
            }
            break;
          }
        }
      } else {
        switch (obj.type) {
          case ObjectiveType.Output: {
            // Add item objective value to output and parse item for recipes
            this.addItemValue(state.itemValues, obj.targetId, obj.value);
            this.parseItemRecursively(obj.targetId, state);
            break;
          }
          case ObjectiveType.Input: {
            // Add item objective value to input, no need to add recipes
            this.addItemValue(state.itemValues, obj.targetId, obj.value, 'in');
            break;
          }
          case ObjectiveType.Maximize: {
            /**
             * Add item objective value to maximize and parse item for recipes
             * Add item to standard output values with 0-value
             */
            this.addItemValue(state.itemValues, obj.targetId, obj.value, 'max');
            this.addItemValue(state.itemValues, obj.targetId);
            this.parseItemRecursively(obj.targetId, state);
            break;
          }
          case ObjectiveType.Limit: {
            /**
             * Add item objective value to limits if current limit is null or
             * greater than this objective's value, no need to add recipes
             * Add item to standard output values with 0-value
             */
            this.addItemValue(state.itemValues, obj.targetId);
            this.parseItemRecursively(obj.targetId, state);
            const current = state.itemValues[obj.targetId].lim;
            if (current == null || current.gt(obj.value)) {
              state.itemValues[obj.targetId].lim = obj.value;
            }
            break;
          }
        }
      }
    }

    // Simplify all maximize values to a ratio
    this.simplifyMaximizeValues(state);

    // Include any output-only items to calculate surplus
    this.addSurplusVariables(state);

    // Parse items that are unproduceable (no recipe available)
    this.parseUnproduceable(state);

    return state;
  }

  /** Find matching recipes for an item that have not yet been parsed */
  private recipeMatches(itemId: string, state: SimplexState): Recipe[] {
    const map = state.hasSurplusCost
      ? state.data.itemAvailableIoRecipeIds
      : state.data.itemAvailableRecipeIds;
    const recipes = map[itemId]
      .filter((r) => !state.recipes[r])
      .map((r) => state.data.adjustedRecipe[r]);

    recipes.forEach((r) => (state.recipes[r.id] = r));

    return recipes;
  }

  /** Find matching item inputs for a recipe that have not yet been parsed */
  private itemMatches(recipe: Recipe, state: SimplexState): string[] {
    const itemIds = new Set<string>();
    Object.keys(recipe.in)
      .filter((i) => state.itemValues[i]?.out == null)
      .forEach((i) => itemIds.add(i));
    if (state.hasSurplusCost) {
      Object.keys(recipe.out)
        .filter((i) => state.itemValues[i]?.out == null)
        .forEach((i) => itemIds.add(i));
    }
    for (const itemId of itemIds) this.addItemValue(state.itemValues, itemId);

    return Array.from(itemIds);
  }

  /** Look for item inputs for a recipe, recursively */
  private parseRecipeRecursively(recipe: Recipe, state: SimplexState): void {
    const matches = this.itemMatches(recipe, state);
    for (const itemId of matches.filter((m) => state.itemIds.includes(m))) {
      this.parseItemRecursively(itemId, state);
    }
  }

  /** Look for recipes that output a passed item, recursively */
  private parseItemRecursively(itemId: string, state: SimplexState): void {
    const matches = this.recipeMatches(itemId, state);
    for (const recipe of matches) {
      this.parseRecipeRecursively(recipe, state);
    }
  }

  private simplifyMaximizeValues(state: SimplexState): void {
    const itemVals = Object.keys(state.itemValues).map(
      (i) => state.itemValues[i],
    );
    const total = itemVals.reduce((r, val) => {
      if (val.max) return r.add(val.max);
      return r;
    }, rational.zero);

    itemVals.forEach((val) => {
      if (val.max) val.max = val.max.div(total);
    });
  }

  /** Include items that only function as outputs to calculate surplus values */
  private addSurplusVariables(state: SimplexState): void {
    const recipes = Object.keys(state.recipes).map((r) => state.recipes[r]);
    for (const recipe of recipes) {
      for (const id of Object.keys(recipe.out).filter(
        (o) => state.itemValues[o]?.out == null,
      )) {
        this.addItemValue(state.itemValues, id);
      }
    }
  }

  /**
   * Determines which items in the matrix are unproduceable (not produced by any
   * recipe)
   */
  private parseUnproduceable(state: SimplexState): void {
    const itemIds = Object.keys(state.itemValues);
    const recipeSet = new Set(Object.keys(state.recipes));
    state.unproduceableIds = new Set(
      itemIds.filter((i) =>
        state.data.itemAvailableRecipeIds[i].every((r) => !recipeSet.has(r)),
      ),
    );
  }
  //#endregion

  //#region Simplex
  /** Convert state to canonical tableau, solve using simplex, and parse solution */
  private getSolution(state: SimplexState): SimplexSolution {
    const glpkResult = this.glpk(state);

    if (glpkResult.error) {
      // No solution found
      return {
        resultType: 'failed',
        returnCode: glpkResult.returnCode,
        simplexStatus: glpkResult.status,
        unboundedRecipeId: glpkResult.unboundedRecipeId,
        surplus: {},
        unproduceable: {},
        excluded: {},
        recipes: {},
        time: 0,
        cost: rational.zero,
        itemIds: [],
        recipeIds: [],
        unproduceableIds: new Set(),
        excludedIds: new Set(),
      };
    }

    const itemIds = Object.keys(state.itemValues);
    const recipeIds = Object.keys(state.recipes);
    const { unproduceableIds, excludedIds } = state;
    const { surplus, unproduceable, excluded, recipes } = glpkResult;

    return {
      resultType: 'solved',
      surplus,
      recipes,
      unproduceable,
      excluded,
      time: glpkResult.time,
      itemIds,
      recipeIds,
      unproduceableIds,
      excludedIds,
      cost: glpkResult.cost,
    };
  }

  private itemCost(
    itemId: string,
    costKey: CostKey,
    state: SimplexState,
  ): number {
    const base =
      state.data.itemRecord[itemId]?.stack == null &&
      state.data.flags.has('fluidCostRatio')
        ? FACTORIO_FLUID_COST_RATIO
        : rational.one;
    const cost = state.costs[costKey];
    return base.mul(cost).toNumber();
  }

  private glpk(state: SimplexState): GlpkResult {
    const itemIds = Object.keys(state.itemValues);
    const recipeIds = Object.keys(state.recipes);

    const m = new Model({ sense: 'min' });
    // Variables for recipes
    const recipeVarRecord: Record<string, Variable> = {};
    // Variables for recipe output objectives, where lb and ub represent
    // objective quantity (no surplus allowed on recipe objectives)
    const recipeObjectiveVarRecord: Record<string, Variable> = {};
    // Variables for (free) inputs, where ub represents input quantity
    const inputVarRecord: Record<string, Variable> = {};
    // Variables for items that cannot be produced by any recipe
    const unproduceableVarRecord: Record<string, Variable> = {};
    // Variables for items that have been excluded
    const excludedVarRecord: Record<string, Variable> = {};
    // Variables for surplus values
    const surplusVarRecord: Record<string, Variable> = {};
    // Variables for maximize item objectives
    const maximizeItemVarRecord: Record<string, Variable> = {};
    // Variables for maximize recipe objectives
    const maximizeRecipeVarRecord: Record<string, Variable> = {};
    // Track net output of items, for item output constraints
    const itemConstrRecord: Record<string, Constraint> = {};
    // Track consumption of items, for item limit constraints
    const inputLimitConstrRecord: Record<string, Constraint> = {};
    // Track number of machines for recipe maximization constraints
    const recipeObjectiveConstrRecord: Record<string, Constraint> = {};
    // Variable for maximization ratio
    const config: VariableProperties = {
      obj: state.costs.maximize.toNumber(),
      lb: 0,
      name: 'maximize',
    };
    const maximizeVar = m.addVar(config);

    // Used to track quantities from maximization ratio
    let maximizeFactor = rational.zero;

    // Add recipe vars to model
    for (const recipeId of recipeIds) {
      const config: VariableProperties = {
        obj: (state.recipes[recipeId].cost ?? rational.zero).toNumber(),
        lb: 0,
        name: recipeId,
      };

      // Add limit, if any
      if (state.recipeLimits[recipeId]) {
        config.ub = state.recipeLimits[recipeId].toNumber();
      }

      recipeVarRecord[recipeId] = m.addVar(config);
    }

    // Add recipe objective vars to model
    for (const obj of state.recipeObjectives) {
      const config: VariableProperties = {
        lb: 0,
        name: obj.id,
      };

      // Set ub/lb if type is output, maximize will be set up later
      if (obj.type === ObjectiveType.Output) {
        config.ub = obj.value.toNumber();
        config.lb = obj.value.toNumber();
      }

      recipeObjectiveVarRecord[obj.id] = m.addVar(config);

      if (obj.type === ObjectiveType.Maximize) {
        switch (state.maximizeType) {
          case MaximizeType.Weight: {
            const varConfig: VariableProperties = {
              obj: obj.value.mul(state.costs.maximize).toNumber(),
              lb: 0,
              name: obj.id,
            };
            maximizeRecipeVarRecord[obj.id] = m.addVar(varConfig);
            const coeffs: [Variable, number][] = [
              [recipeObjectiveVarRecord[obj.id], 1],
              [maximizeRecipeVarRecord[obj.id], -1],
            ];
            const constrConfig: ConstraintProperties = {
              coeffs,
              lb: 0,
              name: obj.id,
            };
            recipeObjectiveConstrRecord[obj.id] = m.addConstr(constrConfig);
            break;
          }
          case MaximizeType.Ratio: {
            maximizeFactor = maximizeFactor.add(obj.value);
            const coeffs: [Variable, number][] = [
              [recipeObjectiveVarRecord[obj.id], 1],
              [maximizeVar, obj.value.inverse().toNumber()],
            ];
            const config: ConstraintProperties = {
              coeffs,
              lb: 0,
              name: obj.id,
            };
            recipeObjectiveConstrRecord[obj.id] = m.addConstr(config);
            break;
          }
        }
      }
    }

    // Add unproduceable vars to model
    for (const itemId of state.unproduceableIds) {
      const obj = this.itemCost(itemId, 'unproduceable', state);
      const config: VariableProperties = {
        obj,
        lb: 0,
        name: itemId,
      };
      unproduceableVarRecord[itemId] = m.addVar(config);
    }

    // Add excluded vars to model
    for (const itemId of state.excludedIds) {
      const obj = this.itemCost(itemId, 'excluded', state);
      const config: VariableProperties = {
        obj,
        lb: 0,
        name: itemId,
      };
      excludedVarRecord[itemId] = m.addVar(config);
    }

    // Add input/output vars to model
    for (const itemId of itemIds) {
      const obj = this.itemCost(itemId, 'surplus', state);
      const config: VariableProperties = {
        obj,
        lb: 0,
        name: itemId,
      };
      surplusVarRecord[itemId] = m.addVar(config);

      const values = state.itemValues[itemId];
      if (values.in) {
        const inputConfig: VariableProperties = {
          lb: 0,
          ub: values.in.toNumber(),
          name: itemId,
        };
        inputVarRecord[itemId] = m.addVar(inputConfig);
      }
    }

    // Add net output and input item constraints to model
    const recipeObjectiveOutput: Record<string, Record<string, Rational>> = {};
    for (const itemId of itemIds) {
      const values = state.itemValues[itemId];
      const netCoeffs: [Variable, number][] = [];
      const inputCoeffs: [Variable, number][] = [];
      state.data.itemAvailableIoRecipeIds[itemId].forEach((recipeId) => {
        const recipe = state.recipes[recipeId];
        if (recipe == null) return;

        const val = recipe.output[itemId];
        if (val?.nonzero()) {
          netCoeffs.push([recipeVarRecord[recipeId], val.toNumber()]);
        }

        if (recipe.in[itemId]) {
          inputCoeffs.push([
            recipeVarRecord[recipeId],
            recipe.in[itemId].div(recipe.time).toNumber(),
          ]);
        }
      });

      for (const obj of state.recipeObjectives) {
        const recipe = obj.recipe;
        const val = recipe.output[itemId];
        if (val?.nonzero()) {
          if (val.gt(rational.zero) && state.requireMachinesOutput) {
            recipeObjectiveOutput[itemId] ??= {};
            recipeObjectiveOutput[itemId][obj.id] = val;
          } else {
            netCoeffs.push([recipeObjectiveVarRecord[obj.id], val.toNumber()]);
          }
        }

        if (recipe.in[itemId]) {
          inputCoeffs.push([
            recipeObjectiveVarRecord[obj.id],
            recipe.in[itemId].div(recipe.time).toNumber(),
          ]);
        }
      }

      // Add unproduceable coeff
      if (state.unproduceableIds.has(itemId)) {
        netCoeffs.push([unproduceableVarRecord[itemId], 1]);
      }

      // Add excluded coeff
      if (state.excludedIds.has(itemId)) {
        netCoeffs.push([excludedVarRecord[itemId], 1]);
      }

      // Add input coeff
      if (values.in) {
        netCoeffs.push([inputVarRecord[itemId], 1]);
      }

      // Add surplus coeff
      netCoeffs.push([surplusVarRecord[itemId], -1]);

      // Add maximize coeff
      if (values.max != null) {
        switch (state.maximizeType) {
          case MaximizeType.Weight: {
            const config: VariableProperties = {
              obj: values.max.mul(state.costs.maximize).toNumber(),
              lb: 0,
              name: itemId,
            };
            maximizeItemVarRecord[itemId] = m.addVar(config);
            netCoeffs.push([maximizeItemVarRecord[itemId], -1]);
            break;
          }
          case MaximizeType.Ratio: {
            maximizeFactor = maximizeFactor.add(values.max);
            netCoeffs.push([maximizeVar, values.max.inverse().toNumber()]);
            break;
          }
        }
      }

      const netConfig: ConstraintProperties = {
        coeffs: netCoeffs,
        lb: values.out.toNumber(),
        ub: values.out.toNumber(),
        name: itemId,
      };
      itemConstrRecord[itemId] = m.addConstr(netConfig);

      if (values.lim) {
        const inputConfig: ConstraintProperties = {
          coeffs: inputCoeffs,
          ub: values.lim.toNumber(),
          name: itemId,
        };
        inputLimitConstrRecord[itemId] = m.addConstr(inputConfig);
      }
    }

    /**
     * Scale maximize cost based on summed values from max objectives. This
     * helps prevent increases in values of maximize objectives from overtaking
     * the maximize cost and resulting in no production as the optimal solution.
     */
    maximizeVar.obj = maximizeVar.obj * maximizeFactor.toNumber();

    // Run GLPK simplex
    const start = Date.now();
    const [returnCode, status] = this.glpkSimplex(m);
    const time = Date.now() - start;
    const surplus: Record<string, Rational> = {};
    const unproduceable: Record<string, Rational> = {};
    const excluded: Record<string, Rational> = {};
    const recipes: Record<string, Rational> = {};
    const cost = rational(m.value);

    if (returnCode !== 'ok' || status !== 'optimal') {
      let ray: Constraint | Variable | undefined;
      try {
        ray = m.ray;
      } catch {
        // Ignore error
      }

      let unboundedRecipeId: string | undefined;
      if (ray && contains(recipeVarRecord, ray)) {
        unboundedRecipeId = ray.name;
      }

      return {
        returnCode,
        status,
        unboundedRecipeId,
        time,
        surplus,
        unproduceable,
        excluded,
        recipes,
        cost,
        error: true,
      };
    }

    // Parse solution
    for (const itemId of itemIds) {
      const values = state.itemValues[itemId];
      const val = rational(surplusVarRecord[itemId].value);
      if (val.nonzero()) surplus[itemId] = val;

      if (recipeObjectiveOutput[itemId]) {
        for (const objId of Object.keys(recipeObjectiveOutput[itemId])) {
          const outRat = recipeObjectiveOutput[itemId][objId];
          const recipeVal = recipeObjectiveVarRecord[objId].value;
          const recipeValRat = rational(recipeVal);
          const val = recipeValRat.mul(outRat);
          values.out = values.out.add(val);
        }
      }

      if (values.max != null) {
        switch (state.maximizeType) {
          case MaximizeType.Ratio: {
            const maxVal = maximizeVar.value;
            const maxRat = rational(maxVal);
            const val = maxRat.mul(values.max);
            // Add maximize output to items output
            values.out = values.out.add(val);
            break;
          }
          case MaximizeType.Weight: {
            const maxVal = maximizeItemVarRecord[itemId].value;
            const val = rational(maxVal);
            // Add maximize output to items output
            values.out = values.out.add(val);
            break;
          }
        }
      }
    }

    for (const recipeId of recipeIds) {
      const val = rational(recipeVarRecord[recipeId].value);
      if (val.nonzero()) recipes[recipeId] = val;
    }

    for (const itemId of state.unproduceableIds) {
      const val = rational(unproduceableVarRecord[itemId].value);
      if (val.nonzero()) unproduceable[itemId] = val;
    }

    for (const itemId of state.excludedIds) {
      const val = rational(excludedVarRecord[itemId].value);
      if (val.nonzero()) excluded[itemId] = val;
    }

    // Update recipe objective counts to account for maximizations
    state.recipeObjectives = state.recipeObjectives.map((o) =>
      spread(o, { value: rational(recipeObjectiveVarRecord[o.id].value) }),
    );

    return {
      returnCode,
      status,
      time,
      surplus,
      unproduceable,
      excluded,
      recipes,
      cost,
      error: false,
    };
  }

  /** Simplex method wrapper mainly for test mocking */
  private glpkSimplex(model: Model): [Simplex.ReturnCode, Status] {
    const returnCode = model.simplex(simplexConfig);
    return [returnCode, model.status];
  }
  //#endregion

  //#region Solution
  /** Update steps with matrix solution */
  private updateSteps(solution: SimplexSolution, state: SimplexState): void {
    for (const itemId of Object.keys(state.itemValues)) {
      this.addItemStep(itemId, solution, state);
    }

    this.assignRecipes(solution, state);
    for (const recipe of Object.keys(solution.recipes).map(
      (r) => state.recipes[r],
    )) {
      this.addRecipeStep(recipe, solution, state);
    }

    for (const objective of state.recipeObjectives) {
      this.addRecipeStep(objective.recipe, solution, state, objective);
    }

    // Move output steps to the top of the list
    state.steps.sort(
      (a, b) => (a.output != null ? 0 : 1) - (b.output != null ? 0 : 1),
    );
  }

  /** Update steps with item from matrix solution */
  private addItemStep(
    itemId: string,
    solution: SimplexSolution,
    state: SimplexState,
  ): void {
    const values = state.itemValues[itemId];
    const steps = state.steps;
    let output = rational.zero;
    state.data.itemAvailableIoRecipeIds[itemId].forEach((recipeId) => {
      const recipeAmt = solution.recipes[recipeId];
      if (recipeAmt == null) return;

      const recipe = state.recipes[recipeId];
      if (recipe?.out[itemId] == null) return;

      const amount = recipe.out[itemId]
        .mul(solution.recipes[recipe.id])
        .div(recipe.time);
      output = output.add(amount);
    });

    const input = state.itemValues[itemId].in;
    if (input) output = output.add(input);

    for (const objective of state.recipeObjectives) {
      const recipe = objective.recipe;
      if (!recipe.out[itemId]) continue;
      output = output.add(
        recipe.out[itemId].mul(objective.value).div(recipe.time),
      );
    }

    if (solution.unproduceable[itemId])
      output = output.add(solution.unproduceable[itemId]);

    if (solution.excluded[itemId])
      output = output.add(solution.excluded[itemId]);

    if (output.nonzero()) {
      // Simplify amounts via float parsing
      output = output.simplify();
      const step: Step = {
        id: steps.length.toString(),
        itemId,
        items: output,
      };
      if (values.out.gt(rational.zero)) {
        step.output = values.out;
        step.parents = { '': step.output };
      }

      steps.push(step);

      if (solution.surplus[itemId]?.nonzero()) {
        /**
         * Check for floating point errors in surplus amount. If surplus only
         * differs from output by a rounding error, set surplus to the output
         * amount, since that is the more reliable value.
         */
        const diff = output.sub(solution.surplus[itemId]).simplify();
        step.surplus = diff.isZero() ? step.items : solution.surplus[itemId];
      }
    }
  }

  /** Attempt to intelligently assign recipes to steps with no recipe */
  private assignRecipes(solution: SimplexSolution, state: SimplexState): void {
    const steps = state.steps;
    const recipes = Object.keys(solution.recipes).map((r) => state.recipes[r]);
    recipes.push(...state.recipeObjectives.map((p) => p.recipe));
    // Check for exact id matches
    for (const step of steps.filter((s) => s.recipeId == null)) {
      const i = recipes.findIndex(
        (r) => r.id === step.itemId && r.produces.has(step.itemId),
      );
      if (i !== -1) {
        step.recipeId = recipes[i].id;
        recipes.splice(i, 1);
      }
    }

    // Find best recipe match for remaining steps
    const potentials: Record<string, string[]> = {};
    for (const step of steps.filter((s) => s.recipeId == null)) {
      if (step.itemId) {
        const itemId = step.itemId;
        potentials[itemId] = recipes
          .filter((r) => r.output[itemId]?.gt(rational.zero))
          .sort((a, b) => b.output[itemId].sub(a.output[itemId]).toNumber())
          .map((r) => r.id);
      }
    }

    // Sort only based on output recipes, ignore input recipes
    const order = Object.keys(potentials).sort(
      (a, b) => potentials[a].length - potentials[b].length,
    );
    for (const itemId of order) {
      for (const option of potentials[itemId]) {
        if (!steps.some((s) => s.recipeId === option)) {
          const step = steps.find((s) => s.itemId === itemId);
          if (step) {
            step.recipeId = option;
            break;
          }
        }
      }
    }
  }

  /** Update steps with recipe from matrix solution */
  private addRecipeStep(
    recipe: AdjustedRecipe,
    solution: SimplexSolution,
    state: SimplexState,
    recipeObjective?: RecipeObjective,
  ): void {
    const steps = state.steps;
    // Don't assign to any step that already has a recipe or objective assigned
    // (Those steps should have non-nullish machines)
    const options = steps.filter((s) => s.machines == null);
    // Look for a step that was selected to be associated with this recipe
    let step = options.find((s) => s.recipeId === recipe.id);
    // Look for any existing step that could be a match
    step ??= options.find(
      (s) =>
        s.recipeId == null && s.itemId != null && recipe.produces.has(s.itemId),
    );

    if (!step) {
      // No step was found, need to create a new one for this recipe/objective
      const index = steps.findIndex(
        (s) => s.itemId && recipe.produces.has(s.itemId),
      );
      step = {
        id: steps.length.toString(),
      };
      if (index !== -1 && index < steps.length - 1) {
        steps.splice(index + 1, 0, step);
      } else {
        steps.push(step);
      }
    }

    step.recipeId = recipe.id;
    step.recipe = recipe;
    if (recipeObjective) {
      step.machines = recipeObjective.value;
      step.recipeObjectiveId = recipeObjective.id;
    } else {
      step.machines = solution.recipes[recipe.id].add(
        step.machines ?? rational.zero,
      );
    }

    this.adjustPowerPollution(step, recipe, state.data);
  }

  private adjustPowerPollution(
    step: Step,
    recipe: Recipe,
    data: Dataset,
  ): void {
    if (step.machines?.nonzero() && !recipe.part) {
      if (recipe.drain?.nonzero() || recipe.consumption?.nonzero()) {
        // Reset power
        step.power = rational.zero;

        // Calculate drain
        if (recipe.drain?.nonzero()) {
          let machines = step.machines.ceil();
          if (data.flags.has('inactiveDrain')) {
            // In DSP drain is not cumulative; only add for inactive machines
            machines = machines.sub(step.machines);
          }

          step.power = step.power.add(machines.mul(recipe.drain));
        }
        // Calculate consumption
        if (recipe.consumption?.nonzero())
          step.power = step.power.add(step.machines.mul(recipe.consumption));
      }

      // Calculate pollution
      if (recipe.pollution?.nonzero())
        step.pollution = step.machines.mul(recipe.pollution);
    }
  }
  //#endregion
}
