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
  Dataset,
  Entities,
  MatrixResult,
  MatrixResultType,
  ObjectiveType,
  Rational,
  RationalItemObjective,
  RationalRecipe,
  RationalRecipeObjective,
  Step,
} from '~/models';
import { Items, Recipes } from '~/store';
import { RateUtility } from './rate.utility';

const FLOAT_TOLERANCE = 1e-10;

const simplexConfig: Simplex.Options = environment.debug
  ? // Don't test debug environment level
    // istanbul ignore next
    {}
  : { msgLevel: 'off' };

export interface MatrixState {
  itemObjectives: RationalItemObjective[];
  recipeObjectives: RationalRecipeObjective[];
  steps: Step[];
  /** Recipes used in the matrix */
  recipes: Entities<RationalRecipe>;
  /** Items used in the matrix */
  itemsOutput: Entities<Rational>;
  /** Items to maximize in the matrix */
  itemsMaximize: Entities<Rational>;
  /** Items to limit in the matrix */
  itemsLimit: Entities<Rational>;
  /** Items that have no included recipe */
  inputIds: string[];
  /** All recipes that are included */
  recipeIds: string[];
  /** All items that are included */
  itemIds: string[];
  data: Dataset;
  costInput: Rational;
  costExcluded: Rational;
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
  /** Items identified as inputs in tableau */
  inputIds: string[];
  /** Surplus items, may be empty */
  surplus: Entities<Rational>;
  /** Input items (no recipe), may be empty */
  inputs: Entities<Rational>;
  /** Recipe values of the solution */
  recipes: Entities<Rational>;
}

export interface GlpkResult {
  surplus: Entities<Rational>;
  recipes: Entities<Rational>;
  inputs: Entities<Rational>;
  cost: Rational;
  returnCode: Simplex.ReturnCode;
  status: Status;
  error: boolean;
  time: number;
}

export class SimplexUtility {
  static addIdValue(
    obj: Entities<Rational>,
    id: string,
    value: Rational
  ): void {
    if (obj[id]) {
      obj[id] = obj[id].add(value);
    } else {
      obj[id] = value;
    }
  }

  static solve(
    itemObjectives: RationalItemObjective[],
    recipeObjectives: RationalRecipeObjective[],
    itemSettings: Items.ItemsState,
    recipeSettings: Recipes.RecipesState,
    costInput: Rational,
    costExcluded: Rational,
    data: Dataset
  ): MatrixResult {
    if (itemObjectives.length === 0 && recipeObjectives.length === 0) {
      return { steps: [], resultType: MatrixResultType.Skipped };
    }

    // Get matrix state
    const state = this.getState(
      itemObjectives,
      recipeObjectives,
      itemSettings,
      recipeSettings,
      costInput,
      costExcluded,
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
      itemIds: solution.itemIds,
      recipeIds: solution.recipeIds,
      inputIds: solution.inputIds,
    };
  }

  //#region Setup
  static getState(
    itemObjectives: RationalItemObjective[],
    recipeObjectives: RationalRecipeObjective[],
    itemSettings: Items.ItemsState,
    recipeSettings: Recipes.RecipesState,
    costInput: Rational,
    costExcluded: Rational,
    data: Dataset
  ): MatrixState {
    // Set up state object
    const state: MatrixState = {
      itemObjectives,
      recipeObjectives,
      steps: [],
      recipes: {},
      itemsOutput: {},
      itemsMaximize: {},
      itemsLimit: {},
      inputIds: [],
      recipeIds: data.recipeIds.filter((r) => !recipeSettings[r].excluded),
      itemIds: data.itemIds.filter((i) => !itemSettings[i].excluded),
      costInput,
      costExcluded,
      data,
    };

    // Add item objectives to matrix state
    for (const obj of itemObjectives) {
      switch (obj.type) {
        case ObjectiveType.Output: {
          this.addIdValue(state.itemsOutput, obj.itemId, obj.rate);
          this.parseItemRecursively(obj.itemId, state);
          break;
        }
        case ObjectiveType.Input: {
          this.addIdValue(state.itemsOutput, obj.itemId, obj.rate.inverse());
          break;
        }
        case ObjectiveType.Maximize: {
          this.addIdValue(state.itemsMaximize, obj.itemId, obj.rate);
          if (!state.itemsOutput[obj.itemId]) {
            state.itemsOutput[obj.itemId] = Rational.zero;
          }

          this.parseItemRecursively(obj.itemId, state);
          break;
        }
        case ObjectiveType.Limit: {
          if (
            state.itemsLimit[obj.itemId] == null ||
            state.itemsLimit[obj.itemId].gt(obj.rate)
          ) {
            state.itemsLimit[obj.itemId] = obj.rate;
          }
          break;
        }
      }
    }

    // Add recipe objectives to matrix state
    for (const recipeObjective of recipeObjectives) {
      for (const itemId of Object.keys(recipeObjective.recipe.out)) {
        state.itemsOutput[itemId] = state.itemsOutput[itemId] ?? Rational.zero;
      }

      this.parseRecipeRecursively(recipeObjective.recipe, state);
    }

    // Include any output-only items to calculate surplus
    this.addSurplusVariables(state);

    // Parse items that are input-only (no recipe available)
    this.parseInputs(state);

    return state;
  }

  /** Find matching recipes for an item that have not yet been parsed */
  static recipeMatches(itemId: string, state: MatrixState): RationalRecipe[] {
    const recipes = state.recipeIds
      .filter((r) => !state.recipes[r])
      .map((r) => state.data.recipeR[r])
      .filter((r) => r.produces(itemId));
    for (const recipe of recipes) {
      state.recipes[recipe.id] = recipe;
    }

    return recipes;
  }

  /** Find matching item inputs for a recipe that have not yet been parsed */
  static itemMatches(recipe: RationalRecipe, state: MatrixState): string[] {
    const itemIds = Object.keys(recipe.in).filter((i) => !state.itemsOutput[i]);
    for (const itemId of itemIds) {
      state.itemsOutput[itemId] = Rational.zero;
    }
    return itemIds;
  }

  /** Look for item inputs for a recipe, recursively */
  static parseRecipeRecursively(
    recipe: RationalRecipe,
    state: MatrixState
  ): void {
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
        (o) => !state.itemsOutput[o]
      )) {
        state.itemsOutput[id] = Rational.zero;
      }
    }
  }

  /** Determines which items in the matrix are input-only (not produced by any recipe, or excluded) */
  static parseInputs(state: MatrixState): void {
    const itemIds = Object.keys(state.itemsOutput);
    const recipeIds = Object.keys(state.recipes);
    state.inputIds = itemIds.filter(
      (i) =>
        !recipeIds.some((r) => state.data.recipeR[r].produces(i)) ||
        state.itemIds.indexOf(i) === -1
    );
  }
  //#endregion

  //#region Simplex
  /** Convert state to canonical tableau, solve using simplex, and parse solution */
  static getSolution(state: MatrixState): MatrixSolution {
    // Get glpk-wasm presolve solution
    const glpkResult = this.glpk(state);

    if (glpkResult.error) {
      console.error(glpkResult.status, glpkResult.returnCode);
      // No solution found
      return {
        resultType: MatrixResultType.Failed,
        returnCode: glpkResult.returnCode,
        simplexStatus: glpkResult.status,
        surplus: {},
        recipes: {},
        inputs: {},
        time: 0,
        cost: Rational.zero,
        itemIds: [],
        recipeIds: [],
        inputIds: [],
      };
    }

    // Convert state to canonical tableau
    const itemIds = Object.keys(state.itemsOutput);
    const recipeIds = Object.keys(state.recipes);
    const inputIds = state.inputIds;

    // Parse solution into usable state
    const surplus = glpkResult.surplus;
    const inputs = glpkResult.inputs;
    const recipes = glpkResult.recipes;
    // const [surplus, recipes, inputs] = this.parseSolution(result.O, state);
    return {
      resultType: MatrixResultType.Solved,
      surplus,
      recipes,
      inputs,
      time: glpkResult.time,
      itemIds,
      recipeIds,
      inputIds,
      cost: glpkResult.cost,
    };
  }

  static glpk(state: MatrixState): GlpkResult {
    const itemIds = Object.keys(state.itemsOutput);
    const recipeIds = Object.keys(state.recipes);

    const m = new Model({ sense: 'min' });
    const recipeVarEntities: Entities<Variable> = {};
    const recipeObjectiveVarEntities: Entities<Variable> = {};
    const inputVarEntities: Entities<Variable> = {};
    const outputVarEntities: Entities<Variable> = {};
    // Track net output of items, for item output/input constraints
    const itemConstrEntities: Entities<Constraint> = {};
    // Track consumption of items, for item limit constraints
    const inputConstrEntities: Entities<Constraint> = {};

    let maximizeVar: Variable | undefined;

    // Add recipe vars to model
    for (const recipeId of recipeIds) {
      const config: VariableProperties = {
        obj: (state.recipes[recipeId].cost ?? Rational.zero).toNumber(),
        lb: 0,
        name: recipeId,
      };
      recipeVarEntities[recipeId] = m.addVar(config);
    }

    // Add recipe objective vars to model
    for (const recipeObjective of state.recipeObjectives) {
      const config: VariableProperties = {
        lb: recipeObjective.count.toNumber(),
        ub: recipeObjective.count.toNumber(),
        name: recipeObjective.id,
      };
      recipeObjectiveVarEntities[recipeObjective.id] = m.addVar(config);
    }

    // Add input vars to model
    for (const itemId of state.inputIds) {
      const cost =
        state.itemIds.indexOf(itemId) === -1
          ? state.costExcluded
          : state.costInput;
      const config: VariableProperties = {
        obj: cost.toNumber(),
        lb: 0,
        name: itemId,
      };
      console.log('input', config);
      inputVarEntities[itemId] = m.addVar(config);
    }

    // Add output vars to model
    for (const itemId of itemIds) {
      const config: VariableProperties = {
        name: itemId,
      };
      if (state.itemsLimit[itemId]) {
        config.ub = state.itemsLimit[itemId].toNumber();
      }
      console.log('output', config);
      outputVarEntities[itemId] = m.addVar(config);
    }

    // Add maximize constraint to model
    const maximizeIds = Object.keys(state.itemsMaximize);
    if (maximizeIds.length > 0) {
      const config: VariableProperties = {
        obj: state.costInput.inverse().toNumber(),
        lb: 0,
        ub: 1000,
        name: 'maximize',
      };
      console.log('maximize', config);
      maximizeVar = m.addVar(config);
    }

    // Add net output and input item constraints to model
    for (const itemId of itemIds) {
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

      // Add input coeff
      if (state.inputIds.indexOf(itemId) !== -1) {
        netCoeffs.push([inputVarEntities[itemId], 1]);
      }

      // Add maximize coeff
      if (maximizeVar != null && state.itemsMaximize[itemId]) {
        netCoeffs.push([
          maximizeVar,
          state.itemsMaximize[itemId].inverse().toNumber(),
        ]);
      }

      const netConfig: ConstraintProperties = {
        coeffs: netCoeffs,
        lb: state.itemsOutput[itemId].toNumber(),
        name: itemId,
      };
      console.log('item', netConfig);
      itemConstrEntities[itemId] = m.addConstr(netConfig);

      if (state.itemsLimit[itemId]) {
        const inputConfig: ConstraintProperties = {
          coeffs: inputCoeffs,
          ub: state.itemsLimit[itemId].toNumber(),
          name: itemId,
        };
        console.log('input', inputConfig);
        inputConstrEntities[itemId] = m.addConstr(inputConfig);
        // netConfig.ub = state.itemsLimit[itemId].toNumber();
      }
    }

    // Run GLPK simplex
    const start = Date.now();
    const [returnCode, status] = this.glpkSimplex(m);
    const time = Date.now() - start;
    const surplus: Entities<Rational> = {};
    const inputs: Entities<Rational> = {};
    const recipes: Entities<Rational> = {};
    const cost = Rational.fromNumber(m.value);

    if (returnCode !== 'ok' || status !== 'optimal') {
      return {
        returnCode,
        status,
        time,
        surplus,
        inputs,
        recipes,
        cost,
        error: true,
      };
    }

    // Parse solution
    for (const itemId of itemIds) {
      if (
        // Include the item if it is part of objectives
        state.itemsOutput[itemId] ||
        // Include item if it is an input
        (inputVarEntities[itemId] &&
          !this.isFloatZero(inputVarEntities[itemId].value)) ||
        // Include item if it is part of solution recipes
        recipeIds.some(
          (r) =>
            !this.isFloatZero(recipeVarEntities[r].value) &&
            (state.recipes[r].in[itemId] || state.recipes[r].out[itemId])
        ) ||
        // Include item if it is part of objective recipes
        state.recipeObjectives.some(
          (p) =>
            !this.isFloatZero(recipeObjectiveVarEntities[p.id].value) &&
            (p.recipe.in[itemId] || p.recipe.out[itemId])
        )
      ) {
        console.log('final value', itemId, itemConstrEntities[itemId].value);
        if (inputConstrEntities[itemId]) {
          console.log(
            'final input value',
            itemId,
            inputConstrEntities[itemId].value
          );
        }
        // Recipes for this item are part of the solution, include result
        const val = Rational.fromNumber(itemConstrEntities[itemId].value).sub(
          state.itemsOutput[itemId]
        );

        if (val.nonzero()) {
          surplus[itemId] = val;
        }
      } else {
        // Item is not part of the solution, remove it
        delete state.itemsOutput[itemId];
      }
    }

    // Clean up inputs
    state.inputIds = state.inputIds.filter((i) => state.itemsOutput[i] != null);

    for (const recipeId of recipeIds) {
      if (this.isFloatZero(recipeVarEntities[recipeId].value)) {
        // Recipe is not part of the solution, remove it
        delete state.recipes[recipeId];
      } else {
        // Recipe is part of the solution, include result
        const val = Rational.fromNumber(recipeVarEntities[recipeId].value);
        if (val.nonzero()) {
          recipes[recipeId] = val;
        }
      }
    }

    for (const inputId of state.inputIds) {
      const val = Rational.fromNumber(inputVarEntities[inputId].value);
      if (val.nonzero()) {
        inputs[inputId] = val;
      }
    }

    return {
      returnCode,
      status,
      time,
      surplus,
      inputs,
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
    for (const itemId of Object.keys(state.itemsOutput)) {
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
    const steps = state.steps;
    let output = Rational.zero;
    for (const recipe of Object.keys(solution.recipes)
      .map((r) => state.recipes[r])
      .filter((r) => r.out[itemId])) {
      const amount = recipe.out[itemId]
        .mul(solution.recipes[recipe.id])
        .div(recipe.time);
      output = output.add(amount);
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

    if (solution.inputs[itemId]) {
      output = output.add(solution.inputs[itemId]);
    }

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
      if (state.itemsOutput[itemId].gt(Rational.zero)) {
        step.output = state.itemsOutput[itemId];
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
    recipe: RationalRecipe,
    solution: MatrixSolution,
    state: MatrixState,
    recipeObjective?: RationalRecipeObjective
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
