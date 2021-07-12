import {
  Dataset,
  Entities,
  ERROR_SIMPLEX,
  ItemId,
  Rational,
  RationalRecipe,
  Step,
  WARNING_HANG,
} from '~/models';
import { ItemsState } from '~/store/items';
import { RateUtility } from './rate.utility';

export interface MatrixState {
  /** Recipes used in the matrix */
  recipes: Entities<RationalRecipe>;
  /** Items used in the matrix */
  items: Entities<Rational>;
  /** Items that have no enabled recipe */
  inputs: string[];
  /** All recipes that are not disabled */
  recipeIds: string[];
  /** All items that are not disabled */
  itemIds: string[];
  data: Dataset;
}

export interface MatrixSolution {
  /** Surplus items, may be empty */
  surplus: Entities<Rational>;
  /** Input items (no recipe), may be empty */
  inputs: Entities<Rational>;
  /** Recipe values of the solution */
  recipes: Entities<Rational>;
}

/** Cost of a standard recipe */
export const COST_RECIPE = Rational.one;
/** Cost of water recipe */
export const COST_WATER = Rational.from(100);
/** Cost of mined resources */
export const COST_MINED = Rational.from(10000);
/** Cost of raw input resources with no recipe */
export const COST_MANUAL = Rational.from(1000000);

export class SimplexUtility {
  /** Solve all remaining steps using simplex method, if necessary */
  static solve(
    steps: Step[],
    itemSettings: ItemsState,
    disabledRecipes: string[],
    data: Dataset,
    error = true
  ): Step[] {
    if (!steps.length) {
      return steps;
    }

    // Get matrix state
    const state = this.getState(steps, itemSettings, disabledRecipes, data);

    if (state == null) {
      // Matrix solution is not required
      return steps;
    }

    // Get solution for matrix state
    const solution = this.getSolution(state, error);

    if (solution == null) {
      if (solution === null && error) {
        alert(ERROR_SIMPLEX);
        console.error('Failed to solve matrix using simplex method');
      }
      return steps;
    }

    // Update steps with solution
    this.updateSteps(steps, solution, state);

    return steps;
  }

  /** Solve simplex for a given item id and return recipes or items in steps */
  static getSteps(
    itemId: string,
    itemSettings: ItemsState,
    disabledRecipes: string[],
    data: Dataset,
    recipes: boolean
  ): [string, Rational][] {
    let steps: Step[] = [];
    RateUtility.addStepsFor(itemId, Rational.one, steps, itemSettings, data);
    steps = this.solve(steps, itemSettings, disabledRecipes, data, false);

    if (recipes) {
      return steps
        .filter((s) => s.recipeId)
        .sort((a, b) =>
          data.recipeR[b.recipeId]
            .output(itemId)
            .sub(data.recipeR[a.recipeId].output(itemId))
            .toNumber()
        )
        .map((s) => [s.recipeId, s.factories]);
    } else {
      return steps.filter((s) => s.itemId).map((s) => [s.itemId, s.items]);
    }
  }

  //#region Setup
  static getState(
    steps: Step[],
    itemSettings: ItemsState,
    disabledRecipes: string[],
    data: Dataset
  ): MatrixState {
    // Set up state object
    const state: MatrixState = {
      recipes: {},
      items: {},
      inputs: null,
      recipeIds: data.recipeIds.filter(
        (r) => disabledRecipes.indexOf(r) === -1
      ),
      itemIds: data.itemIds.filter((i) => !itemSettings[i].ignore),
      data,
    };

    // Check for unsolved steps where matrix is required
    const unsolved = this.unsolvedSteps(steps, state);
    if (unsolved.length === 0) {
      return null; // Matrix solution is not required
    }

    // Add unsolved steps to matrix state
    for (const step of unsolved) {
      state.items[step.itemId] = step.items;
    }

    // Parse unsolved items for recipes
    for (const step of unsolved) {
      this.parseItemRecursively(step.itemId, state);
    }

    // Include any output-only items to calculate surplus
    this.addSurplusVariables(state);

    // Parse items that are input-only (no recipe available)
    this.parseInputs(state);

    return state;
  }

  /** Determine which steps can be solved by the matrix */
  static unsolvedSteps(steps: Step[], state: MatrixState): Step[] {
    return steps.filter(
      (s) =>
        !s.recipeId &&
        state.itemIds.indexOf(s.itemId) !== -1 &&
        state.recipeIds.some((r) => state.data.recipeR[r].produces(s.itemId))
    );
  }

  /** Find matching recipes for an item that have not yet been parsed */
  static recipeMatches(itemId: string, state: MatrixState): RationalRecipe[] {
    const recipes = state.recipeIds
      .filter((r) => !state.recipes[r])
      .map((r) => state.data.recipeR[r])
      .filter((r) => r.out && r.out[itemId]);
    for (const recipe of recipes) {
      state.recipes[recipe.id] = recipe;
    }
    return recipes;
  }

  /** Find matching item inputs for a recipe that have not yet been parsed */
  static itemMatches(recipe: RationalRecipe, state: MatrixState): string[] {
    const itemIds = Object.keys(recipe.in).filter((i) => !state.items[i]);
    for (const itemId of itemIds) {
      state.items[itemId] = Rational.zero;
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
    const simpleRecipeId = state.data.itemRecipeIds[itemId];
    if (simpleRecipeId) {
      if (!state.recipes[simpleRecipeId]) {
        const recipe = state.data.recipeR[simpleRecipeId];
        state.recipes[simpleRecipeId] = recipe;
        this.parseRecipeRecursively(recipe, state);
      }
    } else {
      const matches = this.recipeMatches(itemId, state);
      for (const recipe of matches) {
        this.parseRecipeRecursively(recipe, state);
      }
    }
  }

  /** Include items that only function as outputs to calculate surplus values */
  static addSurplusVariables(state: MatrixState): void {
    const recipes = Object.keys(state.recipes).map((r) => state.recipes[r]);
    for (const recipe of recipes) {
      for (const id of Object.keys(recipe.out).filter((o) => !state.items[o])) {
        state.items[id] = Rational.zero;
      }
    }
  }

  /** Determines which items in the matrix are input-only (not produced by any recipe, or ignored) */
  static parseInputs(state: MatrixState): void {
    const itemIds = Object.keys(state.items);
    const recipeIds = Object.keys(state.recipes);
    state.inputs = itemIds.filter(
      (i) =>
        !recipeIds.some((r) => state.data.recipeR[r].produces(i)) ||
        state.itemIds.indexOf(i) === -1
    );
  }
  //#endregion

  //#region Simplex
  /** Convert state to canonical tableau, solve using simplex, and parse solution */
  static getSolution(state: MatrixState, error = true): MatrixSolution {
    // Convert state to canonical tableau
    const A = this.canonical(state);

    // Solve tableau using simplex method
    const result = this.simplex(A, error);

    if (result) {
      // Parse solution into usable state
      return this.parseSolution(A, state);
    } else {
      // No solution found
      return result === false ? null : undefined;
    }
  }

  /** Convert state into canonical tableau */
  static canonical(state: MatrixState): Rational[][] {
    const itemIds = Object.keys(state.items);
    const recipes = Object.keys(state.recipes).map((r) => state.recipes[r]);
    const A: Rational[][] = [];

    // Build objective row
    const O: Rational[] = [Rational.one]; // C
    for (const itemId of itemIds) {
      // Add item columns
      O.push(state.items[itemId].inverse());
    }
    // Add recipe columns, input columns, and cost
    O.push(
      ...new Array(recipes.length + itemIds.length + 1).fill(Rational.zero)
    );
    A.push(O);

    // Build recipe rows
    for (const recipe of recipes) {
      const R: Rational[] = [Rational.zero]; // C
      for (const itemId of itemIds) {
        // Add item columns
        let val = Rational.zero;
        if (recipe.in?.[itemId]) {
          val = val.sub(recipe.in[itemId]);
        }
        if (recipe.out[itemId]) {
          val = val.add(recipe.out[itemId]);
        }
        R.push(val);
      }
      for (const other of recipes) {
        // Add recipe columns
        R.push(recipe.id === other.id ? Rational.one : Rational.zero);
      }

      // Add input columns
      R.push(...new Array(itemIds.length).fill(Rational.zero));

      // Cost
      if (recipe.id === ItemId.Water) {
        // Cost should be based on number of items, not number of pumps
        // Sum total output and multiply cost by output
        const output = Object.keys(recipe.out).reduce(
          (v, o) => v.add(recipe.out[o]),
          Rational.zero
        );
        R.push(output.mul(COST_WATER));
      } else if (recipe.mining) {
        // Cost should be based on number of items, not number of miners
        // Sum total output and multiply cost by output
        const output = Object.keys(recipe.out).reduce(
          (v, o) =>
            v.add(
              state.data.itemEntities[o].stack
                ? recipe.out[o]
                : // Divide fluid amounts by 10
                  recipe.out[o].div(Rational.ten)
            ),
          Rational.zero
        );
        R.push(output.mul(COST_MINED));
      } else {
        // Cost should be based on number of factories, adjusted for recipe time
        R.push(recipe.time.mul(COST_RECIPE));
      }
      A.push(R);
    }

    // Build input rows
    for (const itemId of state.inputs) {
      const R: Rational[] = [Rational.zero]; // C
      for (const other of itemIds) {
        R.push(itemId === other ? Rational.one : Rational.zero);
      }
      R.push(...new Array(recipes.length).fill(Rational.zero));
      for (const other of itemIds) {
        R.push(itemId === other ? Rational.one : Rational.zero);
      }
      if (state.itemIds.indexOf(itemId) === -1) {
        // Item is ignored, assume unlimited free input
        R.push(Rational.zero);
      } else {
        // Avoid using items that cannot currently be produced
        R.push(COST_MANUAL);
      }
      A.push(R);
    }

    return A;
  }

  /** Solve the canonical tableau using the simplex method */
  static simplex(A: Rational[][], error = true): boolean {
    const start = Date.now();
    let check = true;

    while (true) {
      let c: number = null;
      const O = A[0];
      for (let i = 0; i < O.length - 1; i++) {
        if (c === null || O[i].lt(O[c])) {
          c = i;
        }
      }

      if (!O[c].lt(Rational.zero)) {
        return true;
      }

      if (!this.pivotCol(A, c)) {
        return false;
      }

      if (check && Date.now() - start > 5000) {
        if (error && confirm(WARNING_HANG)) {
          check = false;
        } else {
          return null;
        }
      }
    }
  }

  /** Pivot a column of the tableau */
  static pivotCol(A: Rational[][], c: number): boolean {
    const x = A[0].length - 1;
    let r: number = null;
    let rN: Rational = null;
    for (let i = 1; i < A.length; i++) {
      const R = A[i];
      if (R[c].gt(Rational.zero)) {
        const ratio = R[x].div(R[c]);
        if (rN === null || ratio.lt(rN)) {
          r = i;
          rN = ratio;
        }
      }
    }

    if (r === null) {
      return false;
    }

    return this.pivot(A, c, r);
  }

  /** Performs a simplex pivot operation */
  static pivot(A: Rational[][], c: number, r: number): boolean {
    // Multiply pivot row by reciprocal of pivot element
    const P = A[r];
    const reciprocal = P[c].reciprocal();
    for (let i = 0; i < P.length; i++) {
      P[i] = P[i].mul(reciprocal);
    }

    // Add multiples of pivot row to other rows to change pivot column to 0
    for (let i = 0; i < A.length; i++) {
      if (i !== r && A[i][c].nonzero()) {
        const R = A[i];
        const factor = R[c];
        for (let j = 0; j < R.length; j++) {
          R[j] = R[j].sub(P[j].mul(factor));
        }
      }
    }
    return true;
  }

  /** Parse solution from solved tableau */
  static parseSolution(A: Rational[][], state: MatrixState): MatrixSolution {
    const O = A[0];
    const itemIds = Object.keys(state.items);
    const recipeIds = Object.keys(state.recipes);

    // Parse items
    const surplus: Entities<Rational> = {};
    for (let i = 0; i < itemIds.length; i++) {
      const c = i + 1;
      if (O[c].gt(Rational.zero)) {
        surplus[itemIds[i]] = O[c];
      }
    }

    // Parse recipes
    const recipes: Entities<Rational> = {};
    const inputs: Entities<Rational> = {};
    for (let i = 0; i < recipeIds.length; i++) {
      const c = 1 + itemIds.length + i;
      if (O[c].gt(Rational.zero)) {
        recipes[recipeIds[i]] = O[c];
      }
    }

    // Parse inputs
    for (let i = 0; i < itemIds.length; i++) {
      const c = i + itemIds.length + recipeIds.length + 1;
      if (O[c].gt(Rational.zero)) {
        inputs[itemIds[i]] = O[c];
      }
    }

    return { surplus, inputs, recipes };
  }
  //#endregion

  //#region Solution
  /** Update steps with matrix solution */
  static updateSteps(
    steps: Step[],
    solution: MatrixSolution,
    state: MatrixState
  ): void {
    for (const itemId of Object.keys(state.items)) {
      this.addItemStep(itemId, steps, solution, state);
    }
    this.assignRecipes(steps, solution, state);
    for (const recipe of Object.keys(solution.recipes).map(
      (r) => state.recipes[r]
    )) {
      this.addRecipeStep(recipe, steps, solution);
    }
    this.updateParents(steps, solution, state);
  }

  /** Update steps with item from matrix solution */
  static addItemStep(
    itemId: string,
    steps: Step[],
    solution: MatrixSolution,
    state: MatrixState
  ): void {
    let output = Rational.zero;
    for (const recipe of Object.keys(solution.recipes)
      .map((r) => state.recipes[r])
      .filter((r) => r.out[itemId])) {
      output = output.add(recipe.out[itemId].mul(solution.recipes[recipe.id]));
    }
    if (solution.inputs[itemId]) {
      output = output.add(solution.inputs[itemId]);
    }
    if (output.nonzero()) {
      let step = steps.find((s) => s.itemId === itemId);
      if (step) {
        if (state.items[itemId].nonzero()) {
          step.items = output;
        } else {
          step.items = step.items.add(output);
        }
      } else {
        const recipes = state.data.recipeIds
          .map((r) => state.recipes[r])
          .filter((r) => r);
        const index = steps.findIndex((s) =>
          recipes.some((r) => r.produces(s.itemId) && r.produces(itemId))
        );
        step = {
          itemId,
          items: output,
        };
        if (index !== -1 && index < steps.length - 1) {
          steps.splice(index + 1, 0, step);
        } else {
          steps.push(step);
        }
      }
      if (solution.surplus[itemId]?.nonzero()) {
        step.surplus = solution.surplus[itemId];
      }
    }
  }

  /** Attempt to intelligently assign recipes to steps with no recipe */
  static assignRecipes(
    steps: Step[],
    solution: MatrixSolution,
    state: MatrixState
  ): void {
    const recipes = Object.keys(solution.recipes).map((r) => state.recipes[r]);

    // Check for exact id matches
    for (const step of steps.filter((s) => !s.recipeId)) {
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
    for (const step of steps.filter((s) => !s.recipeId)) {
      potentials[step.itemId] = recipes
        .filter((r) => r.produces(step.itemId))
        .sort((a, b) => Object.keys(a.out).length - Object.keys(b.out).length)
        .map((r) => r.id);
    }

    const order = Object.keys(potentials).sort(
      (a, b) => potentials[a].length - potentials[b].length
    );
    for (const itemId of order) {
      for (const option of potentials[itemId]) {
        if (!steps.some((s) => s.recipeId === option)) {
          const step = steps.find((s) => s.itemId === itemId);
          step.recipeId = option;
          break;
        }
      }
    }
  }

  /** Update steps with recipe from matrix solution */
  static addRecipeStep(
    recipe: RationalRecipe,
    steps: Step[],
    solution: MatrixSolution
  ): void {
    let step = steps.find((s) => s.recipeId === recipe.id);
    if (!step) {
      step = steps.find((s) => !s.recipeId && recipe.produces(s.itemId));
    }
    if (!step) {
      const index = steps.findIndex((s) => recipe.produces(s.itemId));
      step = {
        itemId: null,
        items: null,
      };
      if (index !== -1 && index < steps.length - 1) {
        steps.splice(index + 1, 0, step);
      } else {
        steps.push(step);
      }
    }
    step.recipeId = recipe.id;
    step.factories = solution.recipes[recipe.id]
      .mul(recipe.time)
      .add(step.factories || Rational.zero);
    RateUtility.adjustPowerPollution(step, recipe);
  }

  /** Update parents of steps in matrix solution */
  static updateParents(
    steps: Step[],
    solution: MatrixSolution,
    state: MatrixState
  ): void {
    for (const recipe of Object.keys(solution.recipes)
      .map((r) => state.recipes[r])
      .filter((r) => r.in)) {
      const quantity = solution.recipes[recipe.id];
      for (const itemId of Object.keys(recipe.in).filter((i) =>
        recipe.in[i].nonzero()
      )) {
        const step = steps.find((s) => s.itemId === itemId);
        const rate = recipe.in[itemId].mul(quantity);
        RateUtility.addParentValue(step, recipe.id, rate);
      }
    }
  }
  //#endregion
}
