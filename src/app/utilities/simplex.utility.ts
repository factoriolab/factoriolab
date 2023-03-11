import {
  Constraint,
  ConstraintProperties,
  Model,
  Simplex,
  Status,
  Variable,
  VariableProperties,
} from 'glpk-ts';
import { StatusSimplex } from 'glpk-ts/dist/status';

import { environment } from 'src/environments';
import {
  CostsRtlCfg,
  Dataset,
  Entities,
  ItemRtlObj,
  MatrixResult,
  MatrixResultType,
  ObjectiveType,
  Rational,
  RecipeRtl,
  RecipeRtlObj,
  Step,
} from '~/models';
import { ItemsCfg, RecipesCfg } from '~/store';
import { RateUtility } from './rate.utility';

const FLOAT_TOLERANCE = 1e-10;

const simplexConfig: Simplex.Options = environment.debug
  ? // Don't test debug environment level
    // istanbul ignore next
    {}
  : { msgLevel: 'off' };

export interface ItemValues {
  /** Sum of value from output objectives */
  out: Rational;
  /** Sum of values from input objectives */
  in?: Rational;
  /** Sum of values from max objectives */
  max?: Rational;
  /** Smallest value from limit objectives */
  lim?: Rational;
}

export interface MatrixState {
  itemObjectives: ItemRtlObj[];
  /**
   * Output & Maximize recipe objectives
   *  * Limits moved to `recipeLimits`
   *  * Inputs added to `itemValues`
   */
  recipeObjectives: RecipeRtlObj[];
  steps: Step[];
  /** Recipes used in the matrix */
  recipes: Entities<RecipeRtl>;
  /** Items used in the matrix */
  itemValues: Entities<ItemValues>;
  /** Recipe limits */
  recipeLimits: Entities<Rational>;
  /** Items that have no included recipe */
  unproduceableIds: string[];
  /** Items that are explicitly excluded */
  excludedIds: string[];
  /** All recipes that are included */
  recipeIds: string[];
  /** All items that are included */
  itemIds: string[];
  data: Dataset;
  cost: CostsRtlCfg;
}

export interface MatrixSolution {
  resultType: MatrixResultType;
  /** GLPK simplex return code */
  returnCode?: Simplex.ReturnCode;
  /** GLPK model simplex status */
  simplexStatus?: StatusSimplex;
  /** Runtime in ms */
  time: number;
  /** Overall simplex solution cost */
  cost: Rational;
  /** Items in tableau */
  itemIds: string[];
  /** Recipes in tableau */
  recipeIds: string[];
  /** Items identified as unproduceable */
  unproduceableIds: string[];
  /** Items excluded */
  excludedIds: string[];
  /** Surplus items, may be empty */
  surplus: Entities<Rational>;
  /** Unproduceable items (no recipe), may be empty */
  unproduceable: Entities<Rational>;
  /** Excluded items, may be empty */
  excluded: Entities<Rational>;
  /** Recipe values of the solution */
  recipes: Entities<Rational>;
}

export interface GlpkResult {
  surplus: Entities<Rational>;
  recipes: Entities<Rational>;
  unproduceable: Entities<Rational>;
  excluded: Entities<Rational>;
  cost: Rational;
  returnCode: Simplex.ReturnCode;
  status: Status;
  error: boolean;
  time: number;
}

export class SimplexUtility {
  static addItemValue(
    obj: Entities<ItemValues>,
    id: string,
    value: Rational = Rational.zero,
    key: keyof ItemValues = 'out'
  ): void {
    if (obj[id]) {
      const current = obj[id][key];
      if (current) {
        obj[id][key] = current.add(value);
      } else {
        obj[id][key] = value;
      }
    } else {
      obj[id] = { ...{ out: Rational.zero }, [key]: value };
    }
  }

  static solve(
    itemObjectives: ItemRtlObj[],
    recipeObjectives: RecipeRtlObj[],
    itemsCfg: ItemsCfg.ItemsCfgState,
    recipesCfg: RecipesCfg.RecipesCfgState,
    cost: CostsRtlCfg,
    data: Dataset
  ): MatrixResult {
    if (itemObjectives.length === 0 && recipeObjectives.length === 0) {
      return { steps: [], resultType: MatrixResultType.Skipped };
    }

    // Get matrix state
    const state = this.getState(
      itemObjectives,
      recipeObjectives,
      itemsCfg,
      recipesCfg,
      cost,
      data
    );

    // Get solution for matrix state
    const solution = this.getSolution(state);

    if (solution.resultType === MatrixResultType.Solved) {
      // Update steps with solution
      this.updateSteps(solution, state);
    }

    return {
      steps: state.steps,
      resultType: solution.resultType,
      returnCode: solution.returnCode,
      simplexStatus: solution.simplexStatus,
      time: solution.time,
      cost: solution.cost,
    };
  }

  //#region Setup
  static getState(
    itemObjectives: ItemRtlObj[],
    recipeObjectives: RecipeRtlObj[],
    itemsCfg: ItemsCfg.ItemsCfgState,
    recipesCfg: RecipesCfg.RecipesCfgState,
    cost: CostsRtlCfg,
    data: Dataset
  ): MatrixState {
    // Set up state object
    const state: MatrixState = {
      itemObjectives,
      recipeObjectives: recipeObjectives.filter(
        (o) =>
          o.type === ObjectiveType.Output || o.type === ObjectiveType.Maximize
      ),
      steps: [],
      recipes: {},
      itemValues: {},
      recipeLimits: {},
      unproduceableIds: [],
      excludedIds: data.itemIds.filter((i) => itemsCfg[i].excluded),
      recipeIds: data.recipeIds.filter((r) => !recipesCfg[r].excluded),
      itemIds: data.itemIds.filter((i) => !itemsCfg[i].excluded),
      cost,
      data,
    };

    // Add item objectives to matrix state
    for (const obj of itemObjectives) {
      switch (obj.type) {
        case ObjectiveType.Output: {
          // Add item objective rate to output and parse item for recipes
          this.addItemValue(state.itemValues, obj.itemId, obj.rate);
          this.parseItemRecursively(obj.itemId, state);
          break;
        }
        case ObjectiveType.Input: {
          // Add item objective rate to input, no need to add recipes
          this.addItemValue(state.itemValues, obj.itemId, obj.rate, 'in');
          break;
        }
        case ObjectiveType.Maximize: {
          /**
           * Add item objective rate to maximize and parse item for recipes
           * Add item to standard output values with 0-value
           */
          this.addItemValue(state.itemValues, obj.itemId, obj.rate, 'max');
          this.addItemValue(state.itemValues, obj.itemId);
          this.parseItemRecursively(obj.itemId, state);
          break;
        }
        case ObjectiveType.Limit: {
          /**
           * Add item objective rate to limits if current limit is null or
           * greater than this objective's value, no need to add recipes
           * Add item to standard output values with 0-value
           */
          this.addItemValue(state.itemValues, obj.itemId);
          const current = state.itemValues[obj.itemId].lim;
          if (current == null || current.gt(obj.rate)) {
            state.itemValues[obj.itemId].lim = obj.rate;
          }
          break;
        }
      }
    }

    // Add recipe objectives to matrix state
    for (const obj of recipeObjectives) {
      switch (obj.type) {
        case ObjectiveType.Output:
        case ObjectiveType.Maximize: {
          for (const itemId of Object.keys(obj.recipe.out)) {
            this.addItemValue(state.itemValues, itemId);
          }

          this.parseRecipeRecursively(obj.recipe, state);

          break;
        }
        case ObjectiveType.Input: {
          // Parse inputs and add them as though they were item objective inputs
          for (const itemId of Object.keys(obj.recipe.out).filter((i) =>
            obj.recipe.produces(i)
          )) {
            const rate = obj.count.mul(obj.recipe.output(itemId));
            this.addItemValue(state.itemValues, itemId, rate, 'in');
          }
          break;
        }
        case ObjectiveType.Limit: {
          /**
           * Add recipe objective count to recipe limits if current limit is
           * null or greater than this objective's value
           */
          const current = state.recipeLimits[obj.recipeId];
          if (current == null || current.gt(obj.count)) {
            state.recipeLimits[obj.recipeId] = obj.count;
          }
          break;
        }
      }
    }

    // Include any output-only items to calculate surplus
    this.addSurplusVariables(state);

    // Parse items that are unproduceable (no recipe available)
    this.parseUnproduceable(state);

    return state;
  }

  /** Find matching recipes for an item that have not yet been parsed */
  static recipeMatches(itemId: string, state: MatrixState): RecipeRtl[] {
    const recipes = state.recipeIds
      .filter((r) => !state.recipes[r])
      .map((r) => state.data.recipeR[r])
      .filter((r) => r.produces(itemId));

    recipes.forEach((r) => (state.recipes[r.id] = r));

    return recipes;
  }

  /** Find matching item inputs for a recipe that have not yet been parsed */
  static itemMatches(recipe: RecipeRtl, state: MatrixState): string[] {
    const itemIds = Object.keys(recipe.in).filter(
      (i) => state.itemValues[i]?.out == null
    );
    for (const itemId of itemIds) {
      this.addItemValue(state.itemValues, itemId);
    }
    return itemIds;
  }

  /** Look for item inputs for a recipe, recursively */
  static parseRecipeRecursively(recipe: RecipeRtl, state: MatrixState): void {
    if (recipe.in) {
      const matches = this.itemMatches(recipe, state);
      for (const itemId of matches.filter(
        (m) => state.itemIds.indexOf(m) !== -1
      )) {
        this.parseItemRecursively(itemId, state);
      }
    }
  }

  /** Look for recipes that output a passed item, recursively */
  static parseItemRecursively(itemId: string, state: MatrixState): void {
    const matches = this.recipeMatches(itemId, state);
    for (const recipe of matches) {
      this.parseRecipeRecursively(recipe, state);
    }
  }

  /** Include items that only function as outputs to calculate surplus values */
  static addSurplusVariables(state: MatrixState): void {
    const recipes = Object.keys(state.recipes).map((r) => state.recipes[r]);
    for (const recipe of recipes) {
      for (const id of Object.keys(recipe.out).filter(
        (o) => state.itemValues[o]?.out == null
      )) {
        this.addItemValue(state.itemValues, id);
      }
    }
  }

  /**
   * Determines which items in the matrix are unproduceable (not produced by any
   * recipe)
   */
  static parseUnproduceable(state: MatrixState): void {
    const itemIds = Object.keys(state.itemValues);
    const recipeIds = Object.keys(state.recipes);
    state.unproduceableIds = itemIds.filter(
      (i) => !recipeIds.some((r) => state.data.recipeR[r].produces(i))
    );
  }
  //#endregion

  //#region Simplex
  /** Convert state to canonical tableau, solve using simplex, and parse solution */
  static getSolution(state: MatrixState): MatrixSolution {
    const glpkResult = this.glpk(state);

    if (glpkResult.error) {
      // No solution found
      return {
        resultType: MatrixResultType.Failed,
        returnCode: glpkResult.returnCode,
        simplexStatus: glpkResult.status,
        surplus: {},
        unproduceable: {},
        excluded: {},
        recipes: {},
        time: 0,
        cost: Rational.zero,
        itemIds: [],
        recipeIds: [],
        unproduceableIds: [],
        excludedIds: [],
      };
    }

    const itemIds = Object.keys(state.itemValues);
    const recipeIds = Object.keys(state.recipes);
    const { unproduceableIds, excludedIds } = state;
    const { surplus, unproduceable, excluded, recipes } = glpkResult;

    return {
      resultType: MatrixResultType.Solved,
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

  static glpk(state: MatrixState): GlpkResult {
    const itemIds = Object.keys(state.itemValues);
    const recipeIds = Object.keys(state.recipes);

    const m = new Model({ sense: 'min' });
    // Variables for recipes
    const recipeVarEntities: Entities<Variable> = {};
    // Variables for recipe output objectives, where lb and ub represent
    // objective quantity (no surplus allowed on recipe objectives)
    const recipeObjectiveVarEntities: Entities<Variable> = {};
    // Variables for outputs, where lb represents objective quantity
    const outputVarEntities: Entities<Variable> = {};
    // Variables for (free) inputs, where ub represents input quantity
    const inputVarEntities: Entities<Variable> = {};
    // Variables for items that cannot be produced by any recipe
    const unproduceableVarEntities: Entities<Variable> = {};
    // Variables for items that have been excluded
    const excludedVarEntities: Entities<Variable> = {};
    // Track net output of items, for item output constraints
    const itemConstrEntities: Entities<Constraint> = {};
    // Track consumption of items, for item limit constraints
    const inputLimitConstrEntities: Entities<Constraint> = {};
    // Variable for maximization ratio, if included
    let maximizeVar: Variable | undefined;

    // Add recipe vars to model
    for (const recipeId of recipeIds) {
      const config: VariableProperties = {
        obj: (state.recipes[recipeId].cost ?? Rational.zero).toNumber(),
        lb: 0,
        name: recipeId,
      };

      // Add limit, if any
      if (state.recipeLimits[recipeId]) {
        config.ub = state.recipeLimits[recipeId].toNumber();
        // console.log(recipeId, config.ub);
      }

      recipeVarEntities[recipeId] = m.addVar(config);
    }

    // Add recipe objective vars to model
    for (const obj of state.recipeObjectives) {
      const config: VariableProperties = {
        lb: obj.count.toNumber(),
        ub: obj.count.toNumber(),
        name: obj.id,
      };
      recipeObjectiveVarEntities[obj.id] = m.addVar(config);
    }

    // Add unproduceable vars to model
    for (const itemId of state.unproduceableIds) {
      const config: VariableProperties = {
        obj: state.cost.unproduceable.toNumber(),
        lb: 0,
        name: itemId,
      };
      unproduceableVarEntities[itemId] = m.addVar(config);
    }

    // Add excluded vars to model
    for (const itemId of state.excludedIds) {
      const config: VariableProperties = {
        obj: state.cost.excluded.toNumber(),
        lb: 0,
        name: itemId,
      };
      excludedVarEntities[itemId] = m.addVar(config);
    }

    // Add input/output vars to model
    for (const itemId of itemIds) {
      const config: VariableProperties = {
        obj: state.cost.surplus.toNumber(),
        name: itemId,
      };
      const values = state.itemValues[itemId];
      if (values.lim) {
        config.ub = values.lim.toNumber();
      }

      if (values.in) {
        const inputConfig: VariableProperties = {
          ub: values.in.toNumber(),
          name: itemId,
        };
        inputVarEntities[itemId] = m.addVar(inputConfig);
      }

      outputVarEntities[itemId] = m.addVar(config);
    }

    // Add maximize constraint to model
    const maximizeIds = Object.keys(state.itemValues).filter(
      (i) => state.itemValues[i].max != null
    );
    if (maximizeIds.length > 0) {
      const config: VariableProperties = {
        obj: state.cost.maximize.toNumber(),
        lb: 0,
        name: 'maximize',
      };
      maximizeVar = m.addVar(config);
    }

    // Add net output and input item constraints to model
    for (const itemId of itemIds) {
      const values = state.itemValues[itemId];
      const netCoeffs: [Variable, number][] = [];
      const inputCoeffs: [Variable, number][] = [];
      for (const recipeId of recipeIds) {
        const recipe = state.recipes[recipeId];
        const val = recipe.output(itemId);
        if (val.nonzero()) {
          netCoeffs.push([recipeVarEntities[recipeId], val.toNumber()]);
        }

        if (recipe.in[itemId]) {
          inputCoeffs.push([
            recipeVarEntities[recipeId],
            recipe.in[itemId].div(recipe.time).toNumber(),
          ]);
        }
      }

      for (const recipeObjective of state.recipeObjectives) {
        const recipe = recipeObjective.recipe;
        const val = recipe.output(itemId);
        if (val.nonzero()) {
          netCoeffs.push([
            recipeObjectiveVarEntities[recipeObjective.id],
            val.toNumber(),
          ]);
        }

        if (recipe.in[itemId]) {
          inputCoeffs.push([
            recipeObjectiveVarEntities[recipeObjective.id],
            recipe.in[itemId].div(recipe.time).toNumber(),
          ]);
        }
      }

      // Add unproduceable coeff
      if (state.unproduceableIds.indexOf(itemId) !== -1) {
        netCoeffs.push([unproduceableVarEntities[itemId], 1]);
      }

      // Add input coeff
      if (values.in) {
        netCoeffs.push([inputVarEntities[itemId], 1]);
      }

      // Add maximize coeff
      if (maximizeVar != null && values.max != null) {
        netCoeffs.push([maximizeVar, values.max.inverse().toNumber()]);
      }

      const netConfig: ConstraintProperties = {
        coeffs: netCoeffs,
        lb: values.out?.toNumber(),
        name: itemId,
      };
      itemConstrEntities[itemId] = m.addConstr(netConfig);

      if (values.lim) {
        const inputConfig: ConstraintProperties = {
          coeffs: inputCoeffs,
          ub: values.lim.toNumber(),
          name: itemId,
        };
        inputLimitConstrEntities[itemId] = m.addConstr(inputConfig);
      }
    }

    // Run GLPK simplex
    const start = Date.now();
    const [returnCode, status] = this.glpkSimplex(m);
    const time = Date.now() - start;
    const surplus: Entities<Rational> = {};
    const unproduceable: Entities<Rational> = {};
    const excluded: Entities<Rational> = {};
    const recipes: Entities<Rational> = {};
    const cost = Rational.fromNumber(m.value);

    if (returnCode !== 'ok' || status !== 'optimal') {
      return {
        returnCode,
        status,
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
      const val = Rational.fromNumber(itemConstrEntities[itemId].value).sub(
        values.out ?? Rational.zero
      );

      if (val.nonzero()) {
        surplus[itemId] = val;
      }

      if (values.max != null && maximizeVar != null) {
        const maxVal = maximizeVar.value;
        const maxRat = Rational.fromNumber(maxVal);
        const val = maxRat.mul(values.max);
        // Add maximize output to items output
        values.out = values.out.add(val);
      }
    }

    for (const recipeId of recipeIds) {
      if (!this.isFloatZero(recipeVarEntities[recipeId].value)) {
        const val = Rational.fromNumber(recipeVarEntities[recipeId].value);
        if (val.nonzero()) {
          recipes[recipeId] = val;
        }
      }
    }

    for (const itemId of state.unproduceableIds) {
      const val = Rational.fromNumber(unproduceableVarEntities[itemId].value);
      if (val.nonzero()) {
        unproduceable[itemId] = val;
      }
    }

    for (const itemId of state.excludedIds) {
      const val = Rational.fromNumber(excludedVarEntities[itemId].value);
      if (val.nonzero()) {
        excluded[itemId] = val;
      }
    }

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

  static isFloatZero(val: number): boolean {
    return Math.abs(val) < FLOAT_TOLERANCE;
  }

  /** Simplex method wrapper mainly for test mocking */
  static glpkSimplex(model: Model): [Simplex.ReturnCode, Status] {
    const returnCode = model.simplex(simplexConfig);
    return [returnCode, model.status];
  }
  //#endregion

  //#region Solution
  /** Update steps with matrix solution */
  static updateSteps(solution: MatrixSolution, state: MatrixState): void {
    for (const itemId of Object.keys(state.itemValues)) {
      this.addItemStep(itemId, solution, state);
    }

    this.assignRecipes(solution, state);
    for (const recipe of Object.keys(solution.recipes).map(
      (r) => state.recipes[r]
    )) {
      this.addRecipeStep(recipe, solution, state);
    }

    for (const recipeObjective of state.recipeObjectives) {
      this.addRecipeStep(
        recipeObjective.recipe,
        solution,
        state,
        recipeObjective
      );
    }
  }

  /** Update steps with item from matrix solution */
  static addItemStep(
    itemId: string,
    solution: MatrixSolution,
    state: MatrixState
  ): void {
    const values = state.itemValues[itemId];
    const steps = state.steps;
    let output = Rational.zero;
    for (const recipe of Object.keys(solution.recipes)
      .map((r) => state.recipes[r])
      .filter((r) => r.out[itemId])) {
      const amount = recipe.out[itemId]
        .mul(solution.recipes[recipe.id])
        .div(recipe.time);
      output = output.add(amount);
      // console.log(itemId, recipe.id, output.toNumber());
    }

    for (const itemObjective of state.itemObjectives.filter(
      (o) => o.itemId === itemId && o.type === ObjectiveType.Input
    )) {
      output = output.add(itemObjective.rate);
    }

    for (const recipeObjective of state.recipeObjectives) {
      const recipe = recipeObjective.recipe;
      if (!recipe.out[itemId]) continue;
      output = output.add(
        recipe.out[itemId].mul(recipeObjective.count).div(recipe.time)
      );
    }

    if (solution.unproduceable[itemId]) {
      output = output.add(solution.unproduceable[itemId]);
    }

    if (solution.excluded[itemId]) {
      output = output.add(solution.excluded[itemId]);
    }

    // console.log(itemId, 'final', output.toNumber());

    if (output.nonzero()) {
      const recipes = state.data.recipeIds
        .map((r) => state.recipes[r])
        .filter((r) => r);
      const index = steps.findIndex((i) =>
        recipes.some(
          (r) => i.itemId && r.produces(i.itemId) && r.produces(itemId)
        )
      );
      const step: Step = {
        id: steps.length.toString(),
        itemId,
        items: output,
      };
      if (values.out.gt(Rational.zero)) {
        step.output = values.out;
        step.parents = { '': step.output };
      }

      if (index !== -1 && index < steps.length - 1) {
        steps.splice(index + 1, 0, step);
      } else {
        steps.push(step);
      }

      if (solution.surplus[itemId]?.nonzero()) {
        step.surplus = solution.surplus[itemId];
      }
    }
  }

  /** Attempt to intelligently assign recipes to steps with no recipe */
  static assignRecipes(solution: MatrixSolution, state: MatrixState): void {
    const steps = state.steps;
    const recipes = Object.keys(solution.recipes).map((r) => state.recipes[r]);
    recipes.push(...state.recipeObjectives.map((p) => p.recipe));

    // Check for exact id matches
    for (const step of steps.filter((s) => s.recipeId == null)) {
      const i = recipes.findIndex(
        (r) => r.id === step.itemId && r.produces(step.itemId)
      );
      if (i !== -1) {
        step.recipeId = recipes[i].id;
        recipes.splice(i, 1);
      }
    }

    // Find best recipe match for remaining steps
    const potentials: Entities<string[]> = {};
    for (const step of steps.filter((s) => s.recipeId == null)) {
      if (step.itemId) {
        potentials[step.itemId] = recipes
          .filter((r) => step.itemId && r.produces(step.itemId))
          .sort((a, b) => Object.keys(a.out).length - Object.keys(b.out).length)
          .map((r) => r.id);
      }
    }

    const order = Object.keys(potentials).sort(
      (a, b) => potentials[a].length - potentials[b].length
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
  static addRecipeStep(
    recipe: RecipeRtl,
    solution: MatrixSolution,
    state: MatrixState,
    recipeObjective?: RecipeRtlObj
  ): void {
    const steps = state.steps;
    // Don't assign to any step that already has a recipe or objective assigned
    // (Those steps should have non-nullish machines)
    const options = steps.filter((s) => s.machines == null);
    // Look for a step that was selected to be associated with this recipe
    let step = options.find((s) => s.recipeId === recipe.id);
    if (!step) {
      // Look for any existing step that could be a match
      step = options.find(
        (s) =>
          s.recipeId == null && s.itemId != null && recipe.produces(s.itemId)
      );
    }

    if (!step) {
      // No step was found, need to create a new one for this recipe/objective
      const index = steps.findIndex(
        (s) => s.itemId && recipe.produces(s.itemId)
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
      step.machines = recipeObjective.count;
      step.recipeObjectiveId = recipeObjective.id;
    } else {
      step.machines = solution.recipes[recipe.id].add(
        step.machines || Rational.zero
      );
    }

    RateUtility.adjustPowerPollution(step, recipe, state.data.game);
  }
  //#endregion
}
