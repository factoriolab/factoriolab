import {
  Dataset,
  Entities,
  ItemId,
  ItemSettings,
  Rational,
  RationalRecipe,
  Step,
} from '~/models';

interface MatrixState {
  recipes: Entities<RationalRecipe>;
  items: Entities<Rational>;
  recipeIds: string[];
  itemSettings: ItemSettings;
  data: Dataset;
}

const COST_RECIPE = Rational.one;
const COST_WATER = Rational.from(100);
const COST_MINED = Rational.from(10000);
const COST_MANUAL = Rational.from(1000000);

export class SimplexUtility {
  static testPivot() {
    const tableau = [
      [
        Rational.one, // O
        Rational.zero, // Cr
        Rational.zero, // Wa
        Rational.from(-45), // Pe
        Rational.zero, // Li
        Rational.from(-10), // Hv
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero, // B
      ],
      [
        // hoc
        Rational.zero, // O
        Rational.zero, // Cr
        Rational.from(-30), // Wa
        Rational.zero, // Pe
        Rational.from(30), // Li
        Rational.from(-40), // Hv
        Rational.one,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.one, // B
      ],
      [
        // loc
        Rational.zero, // O
        Rational.zero, // Cr
        Rational.from(-30), // Wa
        Rational.from(20), // Pe
        Rational.from(-30), // Li
        Rational.zero, // Hv
        Rational.zero,
        Rational.one,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.one, // B
      ],
      [
        // basic
        Rational.zero, // O
        Rational.from(-100), // Cr
        Rational.zero, // Wa
        Rational.from(40), // Pe
        Rational.from(30), // Li
        Rational.from(30), // Hv
        Rational.zero,
        Rational.zero,
        Rational.one,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.one, // B
      ],
      [
        // adv
        Rational.zero, // O
        Rational.from(-100), // Cr
        Rational.from(-50), // Wa
        Rational.from(55), // Pe
        Rational.from(45), // Li
        Rational.from(10), // Hv
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.one,
        Rational.zero,
        Rational.zero,
        Rational.one, // B
      ],
      [
        // crude
        Rational.zero, // O
        Rational.one, // Cr
        Rational.zero, // Wa
        Rational.zero, // Pe
        Rational.zero, // Li
        Rational.zero, // Hv
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.one,
        Rational.zero,
        Rational.hundred, // B
      ],
      [
        // water
        Rational.zero, // O
        Rational.zero, // Cr
        Rational.one, // Wa
        Rational.zero, // Pe
        Rational.zero, // Li
        Rational.zero, // Hv
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.one,
        Rational.from(10), // B
      ],
    ];

    console.log('Tableau:');
    this.print(tableau);

    this.simplex(tableau);

    console.log('Found solution:');
    this.print(tableau);
  }

  static solve(
    steps: Step[],
    disabledRecipes: string[],
    itemSettings: ItemSettings,
    data: Dataset
  ) {
    const state: MatrixState = {
      recipes: {},
      items: {},
      recipeIds: data.recipeIds.filter(
        (r) => disabledRecipes.indexOf(r) === -1
      ),
      itemSettings,
      data,
    };
    const unsolved = steps.filter(
      (s) =>
        !itemSettings[s.itemId].ignore &&
        !s.recipeId &&
        state.recipeIds.some((r) => data.recipeR[r].out[s.itemId])
    );

    if (unsolved.length === 0) {
      return steps;
    }

    for (const step of unsolved) {
      state.items[step.itemId] = step.items;
    }

    for (const step of unsolved) {
      this.parseItemRecursively(step.itemId, state);
    }

    const A = this.canonical(state);

    this.simplex(A);

    console.log('Simplex solution:');
    this.print(A);

    const itemIds = Object.keys(state.items);
    const recipeIds = Object.keys(state.recipes);
    for (let i = 0; i < recipeIds.length; i++) {
      const val = A[0][1 + itemIds.length + i];
      const adj = val.mul(state.data.recipeR[recipeIds[i]].time);
      console.log(
        `${recipeIds[i]}: ${val.toFraction()}, or ${adj.toFraction()}`
      );
    }
  }

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

  static itemMatches(recipe: RationalRecipe, state: MatrixState) {
    const itemIds = Object.keys(recipe.in).filter(
      (i) => !state.items[i] && !state.itemSettings[i].ignore
    );
    for (const itemId of itemIds) {
      state.items[itemId] = Rational.zero;
      if (
        state.data.recipeIds.filter((r) => state.data.recipeR[r].out[itemId])
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
    return itemIds;
  }

  static parseRecipeRecursively(recipe: RationalRecipe, state: MatrixState) {
    if (recipe.in) {
      const matches = this.itemMatches(recipe, state);
      for (const itemId of matches) {
        this.parseItemRecursively(itemId, state);
      }
    }
  }

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

  static simplex(A: Rational[][]) {
    console.log('Start simplex solver:');
    this.print(A);
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

  static print(tableau: Rational[][]) {
    console.table(tableau.map((r) => r.map((c) => c.toFraction())));
  }
}
