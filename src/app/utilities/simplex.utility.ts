import {
  Dataset,
  Entities,
  ItemId,
  ItemSettings,
  Rational,
  RationalRecipe,
  Step,
} from '~/models';
import { RateUtility } from './rate.utility';

interface MatrixState {
  /** Recipes used in the matrix */
  recipes: Entities<RationalRecipe>;
  /** Items used in the matrix */
  items: Entities<Rational>;
  /** All recipes that are not disabled */
  recipeIds: string[];
  /** All items that are not disabled */
  itemIds: string[];
  data: Dataset;
}

interface MatrixSolution {
  /** Surplus items, may be empty */
  surplus: Entities<Rational>;
  /** Input items (no recipe), may be empty */
  inputs: Entities<Rational>;
  /** Recipe values of the solution */
  recipes: Entities<Rational>;
}

/** Cost of a standard recipe */
const COST_RECIPE = Rational.one;
/** Cost of water recipe */
const COST_WATER = Rational.from(100);
/** Cost of mined resources */
const COST_MINED = Rational.from(10000);
/** Cost of resouces with no recipe */
const COST_MANUAL = Rational.from(1000000);

export class SimplexUtility {
  /** Solve all remaining steps using simplex method, if necessary */
  static solve(
    steps: Step[],
    itemSettings: ItemSettings,
    disabledRecipes: string[],
    data: Dataset
  ) {
    // Get matrix state
    const state = this.getState(steps, itemSettings, disabledRecipes, data);

    if (state == null) {
      // Matrix solution is not required
      return steps;
    }

    // Get solution for matrix state
    const solution = this.getSolution(state);

    if (solution == null) {
      console.error('Failed to solve matrix using simplex method');
      return steps;
    }

    // Update steps with solution
    this.updateSteps(steps, solution, state);

    return steps;
  }

  //#region Setup
  static getState(
    steps: Step[],
    itemSettings: ItemSettings,
    disabledRecipes: string[],
    data: Dataset
  ) {
    // Set up state object
    const state: MatrixState = {
      recipes: {},
      items: {},
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

    return state;
  }

  /** Determine which steps can be solved by the matrix */
  static unsolvedSteps(steps: Step[], state: MatrixState) {
    return steps.filter(
      (s) =>
        !s.recipeId &&
        state.itemIds.indexOf(s.itemId) !== -1 &&
        state.recipeIds.some((r) => state.data.recipeR[r].out[s.itemId])
    );
  }

  /** Find matching recipes for an item that have not yet been parsed */
  static recipeMatches(itemId: string, state: MatrixState) {
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
  static itemMatches(recipe: RationalRecipe, state: MatrixState) {
    const itemIds = Object.keys(recipe.in).filter(
      (i) => !state.items[i] && state.itemIds.indexOf(i) !== -1
    );
    for (const itemId of itemIds) {
      state.items[itemId] = Rational.zero;
      if (
        state.recipeIds.filter((r) => state.data.recipeR[r].out[itemId])
          .length === 0
      ) {
        // No recipe found, create a fake recipe
        state.recipes[itemId] = new RationalRecipe({
          id: null,
          time: 0,
          out: { [itemId]: 1 },
          producers: [],
        });
      }
    }
    const itemOutIds = Object.keys(recipe.out).filter((i) => !state.items[i]);
    for (const itemId of itemOutIds) {
      state.items[itemId] = Rational.zero;
    }
    return itemIds;
  }

  /** Look for item inputs for a recipe, recursively */
  static parseRecipeRecursively(recipe: RationalRecipe, state: MatrixState) {
    if (recipe.in) {
      const matches = this.itemMatches(recipe, state);
      for (const itemId of matches) {
        this.parseItemRecursively(itemId, state);
      }
    }
  }

  /** Look for recipes that output a passed item, recursively */
  static parseItemRecursively(itemId: string, state: MatrixState) {
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
  //#endregion

  //#region Simplex
  /** Convert state to canonical tableau, solve using simplex, and parse solution */
  static getSolution(state: MatrixState) {
    // Convert state to canonical tableau
    const A = this.canonical(state);

    // Solve tableau using simplex method
    const result = this.simplex(A);

    if (result) {
      // Parse solution into usable state
      return this.parseSolution(A, state);
    } else {
      // No solution found
      return null;
    }
  }

  /** Convert state into canonical tableau */
  static canonical(state: MatrixState) {
    const A: Rational[][] = [];

    // Build objective row
    const O: Rational[] = [Rational.one]; // C
    for (const itemId of Object.keys(state.items)) {
      // Add item columns
      O.push(state.items[itemId].inverse());
    }
    for (const recipeId of Object.keys(state.recipes)) {
      // Add recipe columns
      O.push(Rational.zero);
    }
    O.push(Rational.zero); // Cost
    A.push(O);

    // Build recipe rows
    for (const recipeId of Object.keys(state.recipes)) {
      const R: Rational[] = [Rational.zero]; // C
      const recipe = state.recipes[recipeId];
      for (const itemId of Object.keys(state.items)) {
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
      for (const otherId of Object.keys(state.recipes)) {
        // Add recipe columns
        R.push(recipeId === otherId ? Rational.one : Rational.zero);
      }

      // Cost
      if (recipe.id == null) {
        R.push(COST_MANUAL);
      } else if (recipe.id === ItemId.Water) {
        R.push(COST_WATER);
      } else if (recipe.mining) {
        R.push(COST_MINED);
      } else {
        R.push(COST_RECIPE);
      }
      A.push(R);
    }

    return A;
  }

  /** Solve the canonical tableau using the simplex method */
  static simplex(A: Rational[][]) {
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
    }
  }

  /** Pivot a column of the tableau */
  static pivotCol(A: Rational[][], c: number) {
    let r: number = null;
    let v: Rational = null;
    for (let i = 1; i < A.length; i++) {
      if (A[i][c].gt(Rational.zero)) {
        const ratio = A[i][A[0].length - 1].div(A[i][c]);
        if (v === null || ratio.lt(v)) {
          r = i;
          v = ratio;
        }
      }
    }

    if (r == null) {
      return false;
    }

    return this.pivot(A, c, r);
  }

  /** Performs a simplex pivot operation */
  static pivot(A: Rational[][], c: number, r: number) {
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
    // Parse items
    const itemIds = Object.keys(state.items);
    const surplus: Entities<Rational> = {};
    for (let i = 0; i < itemIds.length; i++) {
      const c = i + 1;
      if (A[0][c].gt(Rational.zero)) {
        surplus[itemIds[i]] = A[0][c];
      }
    }

    // Parse recipes
    const recipeIds = Object.keys(state.recipes);
    const recipes: Entities<Rational> = {};
    const inputs: Entities<Rational> = {};
    for (let i = 0; i < recipeIds.length; i++) {
      const c = 1 + itemIds.length + i;
      if (A[0][c].gt(Rational.zero)) {
        const id = recipeIds[i];
        if (state.recipes[id].id) {
          recipes[id] = A[0][c];
        } else {
          inputs[id] = A[0][c];
        }
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
  ) {
    const depth = Math.max(...steps.map((s) => s.depth)) + 1;
    for (const itemId of Object.keys(state.items)) {
      this.addItemStep(itemId, steps, depth, solution, state);
    }
    this.assignRecipes(steps, solution, state);
    for (const recipe of Object.keys(solution.recipes).map(
      (r) => state.recipes[r]
    )) {
      this.addRecipeStep(recipe, steps, depth, solution);
    }
    this.updateParents(steps, solution, state);
  }

  /** Update steps with item from matrix solution */
  static addItemStep(
    itemId: string,
    steps: Step[],
    depth: number,
    solution: MatrixSolution,
    state: MatrixState
  ) {
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
        step.depth = depth;
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
          recipes.some((r) => r.out[s.itemId] && r.out[itemId])
        );
        step = {
          depth,
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
        step.items = step.items.sub(step.surplus);
      }
    }
  }

  /** Attempt to intelligently assign recipes to steps with no recipe */
  static assignRecipes(
    steps: Step[],
    solution: MatrixSolution,
    state: MatrixState
  ) {
    const potentials: Entities<string[]> = {};
    const recipes = Object.keys(solution.recipes).map((r) => state.recipes[r]);
    for (const step of steps.filter((s) => !s.recipeId)) {
      potentials[step.itemId] = recipes
        .filter((r) => r.out[step.itemId])
        .map((r) => r.id);
    }

    const order = Object.keys(potentials).sort((i) => potentials[i].length);
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
    depth: number,
    solution: MatrixSolution
  ) {
    let step = steps.find((s) => s.recipeId === recipe.id);
    if (!step) {
      step = steps.find((s) => !s.recipeId && recipe.out[s.itemId]);
    }
    if (!step) {
      const index = steps.findIndex((s) => recipe.out[s.itemId]);
      step = {
        depth,
        itemId: null,
        items: null,
      };
      if (index !== -1 && index < steps.length - 1) {
        steps.splice(index + 1, 0, step);
      } else {
        steps.push(step);
      }
    }
    step.depth = depth;
    step.recipeId = recipe.id;
    step.factories = solution.recipes[recipe.id].mul(recipe.time);
    RateUtility.adjustPowerPollution(step, recipe);
  }

  /** Update parents of steps in matrix solution */
  static updateParents(
    steps: Step[],
    solution: MatrixSolution,
    state: MatrixState
  ) {
    for (const recipe of Object.keys(solution.recipes)
      .map((r) => state.recipes[r])
      .filter((r) => r.in)) {
      const quantity = solution.recipes[recipe.id];
      for (const itemId of Object.keys(recipe.in)) {
        const step = steps.find((s) => s.itemId === itemId);
        const rate = recipe.in[itemId].mul(quantity);
        RateUtility.addParentValue(step, recipe.id, rate);
      }
    }
  }
  //#endregion
}
