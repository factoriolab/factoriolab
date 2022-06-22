import {
  Dataset,
  Entities,
  ERROR_SIMPLEX,
  MatrixResult,
  MatrixResultType,
  Rational,
  RationalRecipe,
  Step,
  WARNING_HANG,
} from '~/models';
import * as Items from '~/store/items';
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
  costInput: Rational;
  costIgnored: Rational;
}

export interface MatrixSolution {
  /** Final number of simplex pivots */
  pivots: number;
  /** Runtime in ms */
  time: number;
  /** Simplex canonical matrix */
  A: Rational[][];
  /** Simplex objective solution */
  O: Rational[];
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

export interface MatrixCache {
  O: Rational[];
  R: Rational[];
  pivots: number;
  time: number;
}

export class SimplexUtility {
  static cache: Entities<MatrixCache[]> = {};

  /** Solve all remaining steps using simplex method, if necessary */
  static solve(
    steps: Step[],
    itemSettings: Items.ItemsState,
    disabledRecipeIds: string[],
    costInput: Rational,
    costIgnored: Rational,
    data: Dataset,
    error = true
  ): MatrixResult {
    if (!steps.length) {
      return { steps, result: MatrixResultType.Skipped };
    }

    // Get matrix state
    const state = this.getState(
      steps,
      itemSettings,
      disabledRecipeIds,
      costInput,
      costIgnored,
      data
    );

    if (state == null) {
      // Matrix solution is not required
      return { steps, result: MatrixResultType.Skipped };
    }

    // Get solution for matrix state
    const [result, solution] = this.getSolution(state, error);

    if (
      result === MatrixResultType.Solved ||
      result === MatrixResultType.Cached
    ) {
      // Update steps with solution
      this.updateSteps(steps, solution, state);

      return {
        steps,
        result,
        pivots: solution.pivots,
        time: solution.time,
        A: solution.A,
        O: solution.O,
        itemIds: solution.itemIds,
        recipeIds: solution.recipeIds,
        inputIds: solution.inputIds,
      };
    } else {
      if (result === MatrixResultType.Failed && error) {
        alert(ERROR_SIMPLEX);
        console.error('Failed to solve matrix using simplex method');
      }
      return {
        steps,
        result,
        pivots: solution.pivots,
        time: solution.time,
        A: solution.A,
        O: solution.O,
        itemIds: solution.itemIds,
        recipeIds: solution.recipeIds,
        inputIds: solution.inputIds,
      };
    }
  }

  /** Solve simplex for a given item id and return recipes or items in steps */
  static getSteps(
    itemId: string,
    itemSettings: Items.ItemsState,
    disabledRecipeIds: string[],
    costInput: Rational,
    costIgnored: Rational,
    data: Dataset,
    recipes: boolean,
    simplex: boolean
  ): [string, Rational][] {
    let steps: Step[] = [];
    RateUtility.addStepsFor(itemId, Rational.one, steps, itemSettings, data);

    if (simplex) {
      steps = this.solve(
        steps,
        itemSettings,
        disabledRecipeIds,
        costInput,
        costIgnored,
        data,
        false
      ).steps;
    }

    if (recipes) {
      return steps
        .filter((s) => s.recipeId != null)
        .sort((a, b) =>
          data.recipeR[b.recipeId!]
            .output(itemId)
            .sub(data.recipeR[a.recipeId!].output(itemId))
            .toNumber()
        )
        .map((s) => [s.recipeId!, s.factories!]);
    } else {
      return steps
        .filter((s) => s.itemId != null && s.items != null)
        .map((s) => [s.itemId!, s.items!]);
    }
  }

  //#region Setup
  static getState(
    steps: Step[],
    itemSettings: Items.ItemsState,
    disabledRecipeIds: string[],
    costInput: Rational,
    costIgnored: Rational,
    data: Dataset
  ): MatrixState | null {
    // Set up state object
    const state: MatrixState = {
      recipes: {},
      items: {},
      inputs: [],
      recipeIds: data.recipeIds.filter(
        (r) => disabledRecipeIds.indexOf(r) === -1
      ),
      itemIds: data.itemIds.filter((i) => !itemSettings[i].ignore),
      costInput,
      costIgnored,
      data,
    };

    // Check for unsolved steps where matrix is required
    const unsolved = this.unsolvedSteps(steps, state);
    if (unsolved.length === 0) {
      return null; // Matrix solution is not required
    }

    // Add unsolved steps to matrix state
    for (const step of unsolved) {
      if (step.itemId != null && step.items != null) {
        state.items[step.itemId] = step.items;
      }
    }

    // Parse unsolved items for recipes
    for (const step of unsolved) {
      if (step.itemId) {
        this.parseItemRecursively(step.itemId, state);
      }
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
        s.recipeId == null &&
        s.itemId != null &&
        state.itemIds.indexOf(s.itemId) !== -1 &&
        state.recipeIds.some(
          (r) => s.itemId && state.data.recipeR[r].produces(s.itemId)
        )
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
    const simpleRecipeId = state.data.itemRecipeId[itemId];
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
  static getSolution(
    state: MatrixState,
    error = true
  ): [MatrixResultType, MatrixSolution] {
    // Convert state to canonical tableau
    const A = this.canonical(state);

    const [O, H] = this.hash(A);

    const itemIds = Object.keys(state.items);
    const recipeIds = Object.keys(state.recipes);
    const inputIds = state.inputs;

    // Check cache
    const cache = this.checkCache(O, H);
    if (cache) {
      const [surplus, recipes, inputs] = this.parseSolution(cache.R, state);
      // Found cached result
      return [
        MatrixResultType.Cached,
        {
          surplus,
          recipes,
          inputs,
          pivots: cache.pivots,
          time: cache.time,
          A,
          O: cache.R,
          itemIds,
          recipeIds,
          inputIds,
        },
      ];
    } else {
      // Cache original tableau
      const A0 = A.map((R) => [...R]);
      // Solve tableau using simplex method
      const [result, pivots, time] = this.simplex(A, error);

      if (result === MatrixResultType.Solved) {
        // Parse solution into usable state
        this.cacheResult(O, H, A[0], pivots, time);
        const [surplus, recipes, inputs] = this.parseSolution(A[0], state);
        return [
          result,
          {
            surplus,
            recipes,
            inputs,
            pivots,
            time,
            A: A0,
            O: A[0],
            itemIds,
            recipeIds,
            inputIds,
          },
        ];
      } else {
        // No solution found
        return [
          result,
          {
            surplus: {},
            recipes: {},
            inputs: {},
            pivots,
            time,
            A: A0,
            O: A[0],
            itemIds,
            recipeIds,
            inputIds,
          },
        ];
      }
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
      ...new Array(recipes.length + state.inputs.length + 1).fill(Rational.zero)
    );
    A.push(O);

    // Build recipe rows
    for (const recipe of recipes) {
      const R: Rational[] = [Rational.zero]; // C

      // Add item columns
      for (const itemId of itemIds) {
        let val = Rational.zero;
        if (recipe.in[itemId]) {
          val = val.sub(recipe.in[itemId]);
        }
        if (recipe.out[itemId]) {
          val = val.add(recipe.out[itemId]);
        }
        R.push(val.div(recipe.time));
      }

      // Add recipe columns
      for (const other of recipes) {
        R.push(recipe.id === other.id ? Rational.one : Rational.zero);
      }

      // Add input columns
      R.push(...new Array(state.inputs.length).fill(Rational.zero));

      // Add cost column
      R.push(recipe.cost ?? Rational.zero);

      A.push(R);
    }

    // Build input rows
    for (const itemId of state.inputs) {
      const R: Rational[] = [Rational.zero]; // C

      // Add item columns
      for (const other of itemIds) {
        R.push(itemId === other ? Rational.one : Rational.zero);
      }

      // Add recipe columns
      R.push(...new Array(recipes.length).fill(Rational.zero));

      // Add input columns
      for (const other of state.inputs) {
        R.push(itemId === other ? Rational.one : Rational.zero);
      }

      // Add cost column
      if (state.itemIds.indexOf(itemId) === -1) {
        // Item is ignored, assume unlimited free input
        R.push(state.costIgnored);
      } else {
        // Avoid using items that cannot currently be produced
        R.push(state.costInput);
      }
      A.push(R);
    }

    return A;
  }

  /** Solve the canonical tableau using the simplex method */
  static simplex(
    A: Rational[][],
    error = true
  ): [MatrixResultType, number, number] {
    const timeout = error ? 5000 : 1000;
    const start = Date.now();
    let check = true;

    let p = 0;

    while (true) {
      p++;
      let c = 0;
      const O = A[0];
      for (let i = 1; i < O.length - 1; i++) {
        if (O[i].lt(O[c])) {
          c = i;
        }
      }

      if (!O[c].lt(Rational.zero)) {
        return [MatrixResultType.Solved, p, Date.now() - start];
      }

      if (!this.pivotCol(A, c)) {
        return [MatrixResultType.Failed, p, Date.now() - start];
      }

      const time = Date.now() - start;
      if (check && time > timeout) {
        const warn =
          WARNING_HANG +
          `\n\nmatrix size: ${A.length} x ${A[0].length}, pivots: ${p}, time: ${time}ms`;
        if (error && confirm(warn)) {
          check = false;
        } else {
          return [MatrixResultType.Cancelled, p, time];
        }
      }
    }
  }

  /** Pivot a column of the tableau */
  static pivotCol(A: Rational[][], c: number): boolean {
    const x = A[0].length - 1;
    let r: number | null = null;
    let rN: Rational | null = null;
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
  static parseSolution(
    O: Rational[],
    state: MatrixState
  ): [Entities<Rational>, Entities<Rational>, Entities<Rational>] {
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
    for (let i = 0; i < state.inputs.length; i++) {
      const c = i + itemIds.length + recipeIds.length + 1;
      if (O[c].gt(Rational.zero)) {
        inputs[state.inputs[i]] = O[c];
      }
    }

    return [surplus, recipes, inputs];
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
      output = output.add(
        recipe.out[itemId].mul(solution.recipes[recipe.id]).div(recipe.time)
      );
    }
    if (solution.inputs[itemId]) {
      output = output.add(solution.inputs[itemId]);
    }
    if (output.nonzero()) {
      let step = steps.find((i) => i.itemId === itemId);
      if (step != null) {
        if (state.items[itemId].nonzero()) {
          step.items = output;
        } else {
          step.items = (step.items ?? Rational.zero).add(output);
        }
      } else {
        const recipes = state.data.recipeIds
          .map((r) => state.recipes[r])
          .filter((r) => r);
        const index = steps.findIndex((i) =>
          recipes.some(
            (r) => i.itemId && r.produces(i.itemId) && r.produces(itemId)
          )
        );
        step = {
          id: steps.length.toString(),
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
        if (step.items == null || state.itemIds.indexOf(itemId) !== -1) {
          // If step has no items or item is enabled, just assign surplus
          step.surplus = solution.surplus[itemId];
        } else {
          // Don't add surplus to disabled items, instead reduce items
          step.items = step.items.sub(solution.surplus[itemId]);
          if (step.items.lt(Rational.zero)) {
            // If this lowers items below zero, allow displaying as surplus
            step.surplus = step.items.inverse();
            step.items = Rational.zero;
          }
        }
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
    steps: Step[],
    solution: MatrixSolution
  ): void {
    let step = steps.find((s) => s.recipeId === recipe.id);
    if (!step) {
      step = steps.find(
        (s) =>
          s.recipeId == null && s.itemId != null && recipe.produces(s.itemId)
      );
    }
    if (!step) {
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
    step.factories = solution.recipes[recipe.id].add(
      step.factories || Rational.zero
    );
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
      const quantity = solution.recipes[recipe.id].div(recipe.time);
      for (const itemId of Object.keys(recipe.in).filter((i) =>
        recipe.in[i].nonzero()
      )) {
        const step = steps.find((s) => s.itemId === itemId);
        if (step) {
          const rate = recipe.in[itemId].mul(quantity);
          RateUtility.addParentValue(step, recipe.id, rate);
        }
      }
    }
  }
  //#endregion

  //#region Cache
  static hash(A: Rational[][]): [Rational[], string] {
    const O = [...A[0]];
    const B = A.filter((R, i) => i !== 0);
    const H = B.map((R) => R.map((c) => c.toString()).join(',')).join('\n');
    return [O, H];
  }

  static cacheResult(
    O: Rational[],
    H: string,
    R: Rational[],
    pivots: number,
    time: number
  ): void {
    if (!this.cache[H]) {
      this.cache[H] = [];
    }
    this.cache[H].push({
      O,
      R,
      pivots,
      time,
    });
  }

  static checkCache(O: Rational[], H: string): MatrixCache | null {
    if (this.cache[H]) {
      // Check objective matches
      for (const c of this.cache[H]) {
        const ratio = this.objectiveRatio(O, c.O);
        if (ratio) {
          if (ratio.isOne()) {
            return c;
          } else {
            return { ...c, ...{ R: c.R.map((r) => r.mul(ratio)) } };
          }
        }
      }
    }

    return null;
  }

  static objectiveRatio(O: Rational[], C: Rational[]): Rational | null {
    // Check length first
    if (O.length !== C.length) {
      return null;
    }

    // Check ratio
    let ratio: Rational | null = null;
    for (let i = 1; i < O.length; i++) {
      if (C[i].isZero()) {
        if (!O[i].isZero()) {
          // No match
          return null;
        }
        // Keep looking, both 0
      } else {
        if (O[i].isZero()) {
          // No match
          return null;
        } else if (ratio) {
          // Ratio must match
          if (!ratio.eq(O[i].div(C[i]))) {
            // No match
            return null;
          }
          // Keep going
        } else {
          // Log the ratio
          ratio = O[i].div(C[i]);
        }
      }
    }

    return ratio;
  }
  //#endregion
}
