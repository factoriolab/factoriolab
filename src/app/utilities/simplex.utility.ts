import { Constraint, Model, Simplex, Status, Variable } from 'glpk-ts';

import { environment } from 'src/environments';
import {
  Dataset,
  Entities,
  MatrixResult,
  MatrixResultType,
  Rational,
  RationalProducer,
  RationalProduct,
  RationalRecipe,
  SimplexType,
  Step,
  WARNING_HANG,
} from '~/models';
import { Items } from '~/store';
import { RateUtility } from './rate.utility';

const FLOAT_TOLERANCE = 1e-10;

const simplexConfig: Simplex.Options = environment.debug
  ? // Don't test debug environment level
    // istanbul ignore next
    {}
  : { msgLevel: 'off' };

export interface MatrixState {
  products: RationalProduct[];
  producers: RationalProducer[];
  steps: Step[];
  /** Recipes used in the matrix */
  recipes: Entities<RationalRecipe>;
  /** Items used in the matrix */
  items: Entities<Rational>;
  /** Items that have no enabled recipe */
  inputIds: string[];
  /** All recipes that are not disabled */
  recipeIds: string[];
  /** All items that are not disabled */
  itemIds: string[];
  data: Dataset;
  costInput: Rational;
  costIgnored: Rational;
  simplexType: SimplexType;
}

export interface MatrixSolution {
  resultType: MatrixResultType;
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
  /** Producers in tableau */
  producers: RationalProducer[];
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

export interface SimplexResult {
  type: MatrixResultType;
  pivots: number;
  time: number;
  O: Rational[];
}

export interface GlpkResult {
  O: Rational[];
  returnCode: Simplex.ReturnCode;
  status: Status;
  error: boolean;
  time: number;
}

export interface MatrixCache {
  O: Rational[];
  R: Rational[];
  pivots: number;
  time: number;
}

export class SimplexUtility {
  static cache: Entities<MatrixCache[]> = {};

  static solve(
    products: RationalProduct[],
    producers: RationalProducer[],
    itemSettings: Items.ItemsState,
    disabledRecipeIds: string[],
    costInput: Rational,
    costIgnored: Rational,
    simplexType: SimplexType,
    data: Dataset,
    error = true
  ): MatrixResult {
    if (products.length === 0 && producers.length === 0) {
      return { steps: [], resultType: MatrixResultType.Skipped };
    }

    // Get matrix state
    const state = this.getState(
      products,
      producers,
      itemSettings,
      disabledRecipeIds,
      costInput,
      costIgnored,
      simplexType,
      data
    );

    // Get solution for matrix state
    const solution = this.getSolution(state, error);

    if (
      solution.resultType === MatrixResultType.Solved ||
      solution.resultType === MatrixResultType.Cached
    ) {
      // Update steps with solution
      this.updateSteps(solution, state);
    }

    return {
      steps: state.steps,
      resultType: solution.resultType,
      pivots: solution.pivots,
      time: solution.time,
      A: solution.A,
      O: solution.O,
      itemIds: solution.itemIds,
      producers: solution.producers,
      recipeIds: solution.recipeIds,
      inputIds: solution.inputIds,
    };
  }

  //#region Setup
  static getState(
    products: RationalProduct[],
    producers: RationalProducer[],
    itemSettings: Items.ItemsState,
    disabledRecipeIds: string[],
    costInput: Rational,
    costIgnored: Rational,
    simplexType: SimplexType,
    data: Dataset
  ): MatrixState {
    // Set up state object
    const state: MatrixState = {
      products,
      producers,
      steps: [],
      recipes: {},
      items: {},
      inputIds: [],
      recipeIds: data.recipeIds.filter(
        (r) => disabledRecipeIds.indexOf(r) === -1
      ),
      itemIds: data.itemIds.filter((i) => !itemSettings[i].ignore),
      costInput,
      costIgnored,
      simplexType,
      data,
    };

    // Add products to matrix state
    for (const product of products) {
      state.items[product.itemId] = product.rate;
      // Adjust based on productivity, e.g. for research products
      const recipe = data.recipeR[data.itemRecipeId[product.itemId]];
      if (recipe?.adjustProd) {
        state.items[product.itemId] = state.items[product.itemId].mul(
          recipe.productivity
        );
      }
      this.parseItemRecursively(product.itemId, state);
    }

    // Add producers to matrix state
    for (const producer of producers) {
      for (const itemId of Object.keys(producer.recipe.out)) {
        state.items[itemId] = state.items[itemId] ?? Rational.zero;
      }

      this.parseRecipeRecursively(producer.recipe, state);
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
    const matches = this.recipeMatches(itemId, state);
    for (const recipe of matches) {
      this.parseRecipeRecursively(recipe, state);
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
    state.inputIds = itemIds.filter(
      (i) =>
        !recipeIds.some((r) => state.data.recipeR[r].produces(i)) ||
        state.itemIds.indexOf(i) === -1
    );
  }
  //#endregion

  //#region Simplex
  /** Convert state to canonical tableau, solve using simplex, and parse solution */
  static getSolution(state: MatrixState, error = true): MatrixSolution {
    // Get glpk-wasm presolve solution
    const glpkResult = this.glpk(state);

    if (glpkResult.error) {
      // No solution found
      return {
        resultType: MatrixResultType.Failed,
        surplus: {},
        recipes: {},
        inputs: {},
        pivots: 0,
        time: 0,
        A: [[]],
        O: [],
        itemIds: [],
        producers: [],
        recipeIds: [],
        inputIds: [],
      };
    }

    // Convert state to canonical tableau
    const A = this.canonical(state);

    const [O, H] = this.hash(A);

    const itemIds = Object.keys(state.items);
    const recipeIds = Object.keys(state.recipes);
    const inputIds = state.inputIds;

    // Check cache
    const cache = this.checkCache(O, H);
    if (cache) {
      const [surplus, recipes, inputs] = this.parseSolution(cache.R, state);
      // Found cached result
      return {
        resultType: MatrixResultType.Cached,
        surplus,
        recipes,
        inputs,
        pivots: cache.pivots,
        time: cache.time,
        A,
        O: cache.R,
        itemIds,
        producers: state.producers,
        recipeIds,
        inputIds,
      };
    } else {
      // Cache original tableau
      const A0 = A.map((R) => [...R]);

      const result = this.simplexType(A, state.simplexType, glpkResult, error);

      if (result.type === MatrixResultType.Solved) {
        // Parse solution into usable state
        this.cacheResult(O, H, result);
        const [surplus, recipes, inputs] = this.parseSolution(result.O, state);
        return {
          resultType: result.type,
          surplus,
          recipes,
          inputs,
          pivots: result.pivots,
          time: result.time,
          A: A0,
          O: result.O,
          itemIds,
          producers: state.producers,
          recipeIds,
          inputIds,
        };
      } else {
        // No solution found
        return {
          resultType: result.type,
          surplus: {},
          recipes: {},
          inputs: {},
          pivots: result.pivots,
          time: result.time,
          A: A0,
          O: result.O,
          itemIds,
          producers: state.producers,
          recipeIds,
          inputIds,
        };
      }
    }
  }

  static glpk(state: MatrixState): GlpkResult {
    const itemIds = Object.keys(state.items);
    const recipeIds = Object.keys(state.recipes);

    const m = new Model({ sense: 'min' });
    const recipeVarEntities: Entities<Variable> = {};
    const producerVarEntities: Entities<Variable> = {};
    const inputVarEntities: Entities<Variable> = {};
    const itemConstrEntities: Entities<Constraint> = {};

    // Add recipe vars to model
    for (const recipeId of recipeIds) {
      const config = {
        obj: (state.recipes[recipeId].cost ?? Rational.zero).toNumber(),
        lb: 0,
        name: recipeId,
      };
      recipeVarEntities[recipeId] = m.addVar(config);
    }

    // Add producer vars to model
    for (const producer of state.producers) {
      const config = {
        lb: producer.count.toNumber(),
        ub: producer.count.toNumber(),
        name: producer.id,
      };
      producerVarEntities[producer.id] = m.addVar(config);
    }

    // Add input vars to model
    for (const inputId of state.inputIds) {
      const cost =
        state.itemIds.indexOf(inputId) === -1
          ? state.costIgnored
          : state.costInput;
      const config = {
        obj: cost.toNumber(),
        lb: 0,
        name: inputId,
      };
      inputVarEntities[inputId] = m.addVar(config);
    }

    // Add item constraints to model
    for (const itemId of itemIds) {
      const coeffs: [Variable, number][] = [];
      for (const recipeId of recipeIds) {
        let val = Rational.zero;
        const recipe = state.recipes[recipeId];
        if (recipe.in[itemId]) {
          val = val.sub(recipe.in[itemId]);
        }

        if (recipe.out[itemId]) {
          val = val.add(recipe.out[itemId]);
        }

        if (val.nonzero()) {
          coeffs.push([
            recipeVarEntities[recipeId],
            val.div(recipe.time).toNumber(),
          ]);
        }
      }

      for (const producer of state.producers) {
        let val = Rational.zero;
        const recipe = producer.recipe;
        if (recipe.in[itemId]) {
          val = val.sub(recipe.in[itemId]);
        }

        if (recipe.out[itemId]) {
          val = val.add(recipe.out[itemId]);
        }

        if (val.nonzero()) {
          coeffs.push([
            producerVarEntities[producer.id],
            val.div(recipe.time).toNumber(),
          ]);
        }
      }

      // Add input coeff
      if (state.inputIds.indexOf(itemId) !== -1) {
        coeffs.push([inputVarEntities[itemId], 1]);
      }

      const config = { coeffs, lb: state.items[itemId].toNumber() };
      itemConstrEntities[itemId] = m.addConstr(config);
    }

    // Run GLPK simplex
    const start = Date.now();
    const [returnCode, status] = this.glpkSimplex(m);
    const time = Date.now() - start;

    if (returnCode !== 'ok' || status !== 'optimal') {
      return { returnCode, status, time, O: [], error: true };
    }

    // Set up IBFS
    const O = [Rational.zero];
    for (const itemId of itemIds) {
      if (
        // Include item if it is an input
        (inputVarEntities[itemId] &&
          !this.isFloatZero(inputVarEntities[itemId].value)) ||
        // Include item if it is part of solution recipes
        recipeIds.some(
          (r) =>
            !this.isFloatZero(recipeVarEntities[r].value) &&
            (state.recipes[r].in[itemId] || state.recipes[r].out[itemId])
        ) ||
        // Include item if it is part of producer recipes
        state.producers.some(
          (p) =>
            !this.isFloatZero(producerVarEntities[p.id].value) &&
            (p.recipe.in[itemId] || p.recipe.out[itemId])
        )
      ) {
        // Recipes for this item are part of the solution, include result
        const val = Rational.fromNumber(itemConstrEntities[itemId].value).sub(
          state.items[itemId]
        );

        O.push(val);
      } else {
        // Item is not part of the solution, remove it
        delete state.items[itemId];
      }
    }

    // Add producer columns (0 means balanced solution was found / assumed)
    for (let i = 0; i < state.producers.length; i++) {
      O.push(Rational.zero);
      O.push(Rational.zero);
    }

    // Clean up inputs
    state.inputIds = state.inputIds.filter((i) => state.items[i] != null);

    for (const recipeId of recipeIds) {
      if (this.isFloatZero(recipeVarEntities[recipeId].value)) {
        // Recipe is not part of the solution, remove it
        delete state.recipes[recipeId];
      } else {
        // Recipe is part of the solution, include result
        O.push(Rational.fromNumber(recipeVarEntities[recipeId].value));
      }
    }

    for (const inputId of state.inputIds) {
      O.push(Rational.fromNumber(inputVarEntities[inputId].value));
    }

    O.push(Rational.fromNumber(m.value));

    return { returnCode, status, time, O, error: false };
  }

  static isFloatZero(val: number): boolean {
    return Math.abs(val) < FLOAT_TOLERANCE;
  }

  /** Simplex method wrapper mainly for test mocking */
  static glpkSimplex(model: Model): [Simplex.ReturnCode, Status] {
    const returnCode = model.simplex(simplexConfig);
    return [returnCode, model.status];
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

    for (const producer of state.producers) {
      // Add producer columns
      O.push(producer.count.inverse()); // Lower boundary
      O.push(producer.count); // Upper boundary
    }

    // Add recipe columns, input columns, and cost
    O.push(
      ...new Array(recipes.length + state.inputIds.length + 1).fill(
        Rational.zero
      )
    );
    A.push(O);

    // Build producer rows
    for (const producer of state.producers) {
      const recipe = producer.recipe;
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

      // Add producer columns
      for (const other of state.producers) {
        // Lower boundary
        R.push(producer.id === other.id ? Rational.one : Rational.zero);
        // Upper boundary
        R.push(producer.id === other.id ? Rational.minusOne : Rational.zero);
      }

      // Add recipe columns
      R.push(...new Array(recipes.length).fill(Rational.zero));

      // Add input columns
      R.push(...new Array(state.inputIds.length).fill(Rational.zero));

      // Add cost column
      R.push(Rational.zero);

      A.push(R);
    }

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

      // Add producer columns (2 each, LB + UB)
      R.push(...new Array(state.producers.length * 2).fill(Rational.zero));

      // Add recipe columns
      for (const other of recipes) {
        R.push(recipe.id === other.id ? Rational.one : Rational.zero);
      }

      // Add input columns
      R.push(...new Array(state.inputIds.length).fill(Rational.zero));

      // Add cost column
      R.push(recipe.cost ?? Rational.zero);

      A.push(R);
    }

    // Build input rows
    for (const itemId of state.inputIds) {
      const R: Rational[] = [Rational.zero]; // C

      // Add item columns
      for (const other of itemIds) {
        R.push(itemId === other ? Rational.one : Rational.zero);
      }

      // Add producer columns (2 each, LB + UB)
      R.push(...new Array(state.producers.length * 2).fill(Rational.zero));

      // Add recipe columns
      R.push(...new Array(recipes.length).fill(Rational.zero));

      // Add input columns
      for (const other of state.inputIds) {
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

  /** Solve the canonical tableau using the selected simplex type */
  static simplexType(
    A: Rational[][],
    simplexType: SimplexType,
    glpkResult: GlpkResult,
    error = true
  ): SimplexResult {
    if (simplexType === SimplexType.JsBigIntRational) {
      const result = this.simplex(A, error);
      result.time += glpkResult.time;
      return result;
    } else {
      return {
        type: MatrixResultType.Solved,
        pivots: 0,
        time: glpkResult.time,
        O: glpkResult.O,
      };
    }
  }

  /** Solve the canonical tableau using the simplex method */
  static simplex(A: Rational[][], error = true): SimplexResult {
    const timeout = error ? 5000 : 1000;
    let time = 0;
    let check = true;
    let start = Date.now();

    let p = 0;

    for (;;) {
      p++;
      let c = 0;
      const O = A[0];
      for (let i = 1; i < O.length - 1; i++) {
        if (O[i].lt(O[c])) {
          c = i;
        }
      }

      if (!O[c].lt(Rational.zero)) {
        return {
          type: MatrixResultType.Solved,
          pivots: p,
          time: time + Date.now() - start,
          O: A[0],
        };
      }

      if (!this.pivotCol(A, c)) {
        return {
          type: MatrixResultType.Failed,
          pivots: p,
          time: time + Date.now() - start,
          O: A[0],
        };
      }

      if (check) {
        const time_check = Date.now() - start;
        if (time_check > timeout) {
          const warn =
            WARNING_HANG +
            `\n\nmatrix size: ${A.length} x ${A[0].length}, pivots: ${p}, time: ${time_check}ms`;
          if (error && confirm(warn)) {
            start = Date.now();
            time = time_check;
            check = false;
          } else {
            return {
              type: MatrixResultType.Cancelled,
              pivots: p,
              time: time_check,
              O: A[0],
            };
          }
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

    const nextCols = 1 + itemIds.length + state.producers.length * 2;

    // Parse recipes
    const recipes: Entities<Rational> = {};
    const inputs: Entities<Rational> = {};
    for (let i = 0; i < recipeIds.length; i++) {
      const c = nextCols + i;
      if (O[c].gt(Rational.zero)) {
        recipes[recipeIds[i]] = O[c];
      }
    }

    // Parse inputs
    for (let i = 0; i < state.inputIds.length; i++) {
      const c = nextCols + recipeIds.length + i;
      if (O[c].gt(Rational.zero)) {
        inputs[state.inputIds[i]] = O[c];
      }
    }

    return [surplus, recipes, inputs];
  }
  //#endregion

  //#region Solution
  /** Update steps with matrix solution */
  static updateSteps(solution: MatrixSolution, state: MatrixState): void {
    for (const itemId of Object.keys(state.items)) {
      this.addItemStep(itemId, solution, state);
    }

    this.assignRecipes(solution, state);
    for (const recipe of Object.keys(solution.recipes).map(
      (r) => state.recipes[r]
    )) {
      this.addRecipeStep(recipe, solution, state);
    }

    for (const producer of state.producers) {
      this.addRecipeStep(producer.recipe, solution, state, producer);
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

    for (const producer of state.producers) {
      const recipe = producer.recipe;
      if (!recipe.out[itemId]) continue;
      output = output.add(
        recipe.out[itemId].mul(producer.count).div(recipe.time)
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
      if (state.items[itemId].nonzero()) {
        step.output = state.items[itemId];
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
    recipes.push(...state.producers.map((p) => p.recipe));

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
    producer?: RationalProducer
  ): void {
    const steps = state.steps;
    // Don't assign to any step that already has a recipe or producer assigned
    // (Those steps should have non-nullish factories)
    const options = steps.filter((s) => s.factories == null);
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
      // No step was found, need to create a new one for this recipe/producer
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
    if (producer) {
      step.factories = producer.count;
      step.producerId = producer.id;
    } else {
      step.factories = solution.recipes[recipe.id].add(
        step.factories || Rational.zero
      );
    }

    RateUtility.adjustPowerPollution(step, recipe, state.data.game);
  }
  //#endregion

  //#region Cache
  static hash(A: Rational[][]): [Rational[], string] {
    const O = [...A[0]];
    const B = A.filter((R, i) => i !== 0);
    const H = B.map((R) => R.map((c) => c.toString()).join(',')).join('\n');
    return [O, H];
  }

  static cacheResult(O: Rational[], H: string, result: SimplexResult): void {
    if (!this.cache[H]) {
      this.cache[H] = [];
    }

    this.cache[H].push({
      O,
      R: result.O,
      pivots: result.pivots,
      time: result.time,
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
