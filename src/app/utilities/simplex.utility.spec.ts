import { ItemId, Mocks, RecipeId } from 'src/tests';
import { MatrixResultType, Rational, RationalRecipe, Step } from '~/models';
import { RateUtility } from './rate.utility';
import { MatrixSolution, MatrixState, SimplexUtility } from './simplex.utility';

describe('SimplexUtility', () => {
  const getState = (): MatrixState => ({
    recipes: {},
    items: {},
    inputs: [],
    recipeIds: Mocks.Dataset.recipeIds,
    itemIds: Mocks.Dataset.itemIds,
    data: Mocks.AdjustedData,
    costInput: Rational.from(1000000),
    costIgnored: Rational.zero,
  });
  /** https://en.wikipedia.org/wiki/Simplex_algorithm#Example */
  const getTableau = (): Rational[][] => [
    [
      Rational.one,
      Rational.from(-2),
      Rational.from(-3),
      Rational.from(-4),
      Rational.zero,
      Rational.zero,
      Rational.zero,
    ],
    [
      Rational.zero,
      Rational.from(3),
      Rational.from(2),
      Rational.one,
      Rational.one,
      Rational.zero,
      Rational.from(10),
    ],
    [
      Rational.zero,
      Rational.from(2),
      Rational.from(5),
      Rational.from(3),
      Rational.zero,
      Rational.one,
      Rational.from(15),
    ],
  ];
  const getSolution = (): Rational[][] => [
    [
      Rational.one,
      Rational.from(2, 3),
      Rational.from(11, 3),
      Rational.zero,
      Rational.zero,
      Rational.from(4, 3),
      Rational.from(20),
    ],
    [
      Rational.zero,
      Rational.from(7, 3),
      Rational.from(1, 3),
      Rational.zero,
      Rational.one,
      Rational.from(-1, 3),
      Rational.from(5),
    ],
    [
      Rational.zero,
      Rational.from(2, 3),
      Rational.from(5, 3),
      Rational.one,
      Rational.zero,
      Rational.from(1, 3),
      Rational.from(5),
    ],
  ];
  const getResult = (): MatrixSolution => ({
    surplus: {},
    recipes: {},
    inputs: {},
    pivots: 1,
    time: 2,
    A: [],
    O: [],
    itemIds: [],
    recipeIds: [],
    inputIds: [],
  });

  beforeEach(() => {
    SimplexUtility.cache = {};
  });

  describe('solve', () => {
    it('should handle empty list of steps', () => {
      expect(
        SimplexUtility.solve(
          [],
          {},
          [],
          Rational.zero,
          Rational.zero,
          Mocks.AdjustedData
        )
      ).toEqual({
        steps: [],
        result: MatrixResultType.Skipped,
      });
    });

    it('should handle fully solved steps', () => {
      spyOn(SimplexUtility, 'getState').and.returnValue(null);
      expect(
        SimplexUtility.solve(
          Mocks.Steps,
          {},
          [],
          Rational.zero,
          Rational.zero,
          Mocks.AdjustedData
        )
      ).toEqual({
        steps: Mocks.Steps,
        result: MatrixResultType.Skipped,
      });
    });

    it('should handle failure of simplex method', () => {
      spyOn(SimplexUtility, 'getState').and.returnValue(true as any);
      spyOn(SimplexUtility, 'getSolution').and.returnValue([
        MatrixResultType.Failed,
        getResult(),
      ]);
      spyOn(console, 'error');
      spyOn(window, 'alert');
      expect(
        SimplexUtility.solve(
          Mocks.Steps,
          {},
          [],
          Rational.zero,
          Rational.zero,
          Mocks.AdjustedData
        )
      ).toEqual({
        steps: Mocks.Steps,
        result: MatrixResultType.Failed,
        pivots: 1,
        time: 2,
        A: [],
        O: [],
        itemIds: [],
        recipeIds: [],
        inputIds: [],
      });
      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalled();
    });

    it('should handle timeout and quit in simplex method', () => {
      spyOn(SimplexUtility, 'getState').and.returnValue(true as any);
      spyOn(SimplexUtility, 'getSolution').and.returnValue([
        MatrixResultType.Cancelled,
        getResult(),
      ]);
      spyOn(console, 'error');
      spyOn(window, 'alert');
      expect(
        SimplexUtility.solve(
          Mocks.Steps,
          {},
          [],
          Rational.zero,
          Rational.zero,
          Mocks.AdjustedData
        )
      ).toEqual({
        steps: Mocks.Steps,
        result: MatrixResultType.Cancelled,
        pivots: 1,
        time: 2,
        A: [],
        O: [],
        itemIds: [],
        recipeIds: [],
        inputIds: [],
      });
      expect(console.error).not.toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should update steps with solution from simplex method', () => {
      spyOn(SimplexUtility, 'getState').and.returnValue(true as any);
      const result = getResult();
      spyOn(SimplexUtility, 'getSolution').and.returnValue([
        MatrixResultType.Solved,
        result,
      ]);
      spyOn(SimplexUtility, 'updateSteps');
      expect(
        SimplexUtility.solve(
          Mocks.Steps,
          {},
          [],
          Rational.zero,
          Rational.zero,
          Mocks.AdjustedData
        )
      ).toEqual({
        steps: Mocks.Steps,
        result: MatrixResultType.Solved,
        pivots: 1,
        time: 2,
        A: [],
        O: [],
        itemIds: [],
        recipeIds: [],
        inputIds: [],
      });
      expect(SimplexUtility.updateSteps).toHaveBeenCalledWith(
        Mocks.Steps,
        result,
        true as any
      );
    });

    it('should include heavy oil cracking', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.PetroleumGas,
        items: Rational.one,
      };
      const result = SimplexUtility.solve(
        [step],
        Mocks.ItemSettingsInitial,
        [],
        Rational.from(1000000),
        Rational.zero,
        Mocks.AdjustedData
      );
      const hocStep = result.steps.find(
        (s) => s.recipeId === RecipeId.HeavyOilCracking
      );
      expect(hocStep!.factories!.gt(Rational.zero)).toBeTrue();
    });
  });

  describe('getSteps', () => {
    it('should get item step information for an item', () => {
      expect(
        SimplexUtility.getSteps(
          ItemId.CopperPlate,
          Mocks.ItemSettingsInitial,
          [],
          Rational.from(1000000),
          Rational.zero,
          Mocks.AdjustedData,
          false,
          true
        )
      ).toEqual([
        [ItemId.CopperPlate, Rational.one],
        [ItemId.CopperOre, Rational.from(5, 6)],
      ]);
    });

    it('should not call simplex solver when disabled', () => {
      spyOn(SimplexUtility, 'solve');
      SimplexUtility.getSteps(
        ItemId.CopperPlate,
        Mocks.ItemSettingsInitial,
        [],
        Rational.from(1000000),
        Rational.zero,
        Mocks.AdjustedData,
        true,
        false
      );
      expect(SimplexUtility.solve).not.toHaveBeenCalled();
    });
  });

  describe('getState', () => {
    it('should return null for fully solved steps', () => {
      spyOn(SimplexUtility, 'unsolvedSteps').and.returnValue([]);
      expect(
        SimplexUtility.getState(
          Mocks.Steps,
          Mocks.ItemSettingsInitial,
          [],
          Rational.from(1000000),
          Rational.zero,
          Mocks.Dataset
        )
      ).toBeNull();
    });

    it('should parse unsolved steps', () => {
      const id = 'id';
      const step: any = { itemId: id, items: Rational.one };
      spyOn(SimplexUtility, 'unsolvedSteps').and.returnValue([step]);
      spyOn(SimplexUtility, 'parseItemRecursively');
      spyOn(SimplexUtility, 'addSurplusVariables');
      const result = SimplexUtility.getState(
        Mocks.Steps,
        Mocks.ItemSettingsInitial,
        [],
        Rational.from(1000000),
        Rational.zero,
        Mocks.Dataset
      );
      expect(SimplexUtility.parseItemRecursively).toHaveBeenCalledTimes(1);
      expect(SimplexUtility.addSurplusVariables).toHaveBeenCalledTimes(1);
      expect(result!.items[id]).toEqual(Rational.one);
    });

    it('should build full state object', () => {
      spyOn(SimplexUtility, 'unsolvedSteps').and.returnValue([Mocks.Step1]);
      spyOn(SimplexUtility, 'parseItemRecursively');
      const result = SimplexUtility.getState(
        Mocks.Steps,
        Mocks.ItemSettingsInitial,
        [],
        Rational.from(1000000),
        Rational.zero,
        Mocks.Dataset
      );
      expect(SimplexUtility.parseItemRecursively).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        recipes: {},
        items: { [Mocks.Step1.itemId!]: Mocks.Step1.items! },
        inputs: [Mocks.Step1.itemId!],
        recipeIds: Mocks.Dataset.recipeIds,
        itemIds: Mocks.Dataset.itemIds,
        data: Mocks.Dataset,
        costInput: Rational.from(1000000),
        costIgnored: Rational.zero,
      });
    });
  });

  describe('unsolvedSteps', () => {
    const control: any = {
      itemId: ItemId.Coal,
    };

    it('should filter for steps that have no recipe', () => {
      const filter: any = {
        itemId: ItemId.Coal,
        recipeId: RecipeId.Coal,
      };
      const steps = [control, filter];
      const result = SimplexUtility.unsolvedSteps(steps, getState());
      expect(result).toEqual([control]);
    });

    it('should filter for steps that match an item', () => {
      const filter: any = {
        itemId: 'itemId',
      };
      const steps = [control, filter];
      const result = SimplexUtility.unsolvedSteps(steps, getState());
      expect(result).toEqual([control]);
    });

    it('should filter for steps that match a recipe id', () => {
      const filter: any = {
        itemId: ItemId.IronOre,
      };
      const state = getState();
      state.recipeIds = [RecipeId.Coal];
      const steps = [control, filter];
      const result = SimplexUtility.unsolvedSteps(steps, state);
      expect(result).toEqual([control]);
    });
  });

  describe('recipeMatches', () => {
    it('should find matching recipes for an item', () => {
      const state = getState();
      const recipe = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      const result = SimplexUtility.recipeMatches(ItemId.Coal, state);
      expect(state.recipes).toEqual({ [RecipeId.Coal]: recipe });
      expect(result).toEqual([recipe]);
    });
  });

  describe('itemMatches', () => {
    it('should find matching items for a recipe', () => {
      const state = getState();
      const recipe = Mocks.AdjustedData.recipeR[RecipeId.CopperCable];
      const result = SimplexUtility.itemMatches(recipe, state);
      expect(state.items).toEqual({ [ItemId.CopperPlate]: Rational.zero });
      expect(state.recipes).toEqual({});
      expect(result).toEqual([ItemId.CopperPlate]);
    });
  });

  describe('parseRecipeRecursively', () => {
    it('should do nothing for recipes with no inputs', () => {
      spyOn(SimplexUtility, 'parseItemRecursively');
      SimplexUtility.parseRecipeRecursively(
        Mocks.AdjustedData.recipeR[RecipeId.IronOre],
        getState()
      );
      expect(SimplexUtility.parseItemRecursively).not.toHaveBeenCalled();
    });

    it('should parse recipe inputs recursively', () => {
      spyOn(SimplexUtility, 'itemMatches').and.returnValue([
        ItemId.CopperPlate,
      ]);
      spyOn(SimplexUtility, 'parseItemRecursively');
      const recipe = Mocks.AdjustedData.recipeR[RecipeId.CopperCable];
      const state = getState();
      SimplexUtility.parseRecipeRecursively(recipe, state);
      expect(SimplexUtility.itemMatches).toHaveBeenCalledWith(recipe, state);
      expect(SimplexUtility.parseItemRecursively).toHaveBeenCalledWith(
        ItemId.CopperPlate,
        state
      );
    });
  });

  describe('parseItemRecursively', () => {
    it('should do nothing for simple recipe that was already parsed', () => {
      spyOn(SimplexUtility, 'parseRecipeRecursively');
      const state = getState();
      state.recipes[RecipeId.CopperCable] =
        Mocks.AdjustedData.recipeR[RecipeId.CopperCable];
      SimplexUtility.parseItemRecursively(ItemId.CopperCable, state);
      expect(SimplexUtility.parseRecipeRecursively).not.toHaveBeenCalled();
    });

    it('should parse a simple recipe', () => {
      spyOn(SimplexUtility, 'parseRecipeRecursively');
      const state = getState();
      SimplexUtility.parseItemRecursively(ItemId.CopperCable, state);
      expect(SimplexUtility.parseRecipeRecursively).toHaveBeenCalledWith(
        Mocks.AdjustedData.recipeR[RecipeId.CopperCable],
        state
      );
    });

    it('should get complex recipe matches and parse them', () => {
      const recipe = Mocks.AdjustedData.recipeR[RecipeId.AdvancedOilProcessing];
      spyOn(SimplexUtility, 'recipeMatches').and.returnValue([recipe]);
      spyOn(SimplexUtility, 'parseRecipeRecursively');
      const state = getState();
      SimplexUtility.parseItemRecursively(ItemId.PetroleumGas, state);
      expect(SimplexUtility.recipeMatches).toHaveBeenCalledWith(
        ItemId.PetroleumGas,
        state
      );
      expect(SimplexUtility.parseRecipeRecursively).toHaveBeenCalledWith(
        recipe,
        state
      );
    });
  });

  describe('addSurplusVariables', () => {
    it('should add other items that only appear as recipe outputs', () => {
      const state = getState();
      state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      SimplexUtility.addSurplusVariables(state);
      expect(state.items[ItemId.Coal]).toEqual(Rational.zero);
    });
  });

  describe('parseInputs', () => {
    it('should parse input-only items', () => {
      const state = getState();
      // Coal = ignored input, Wood = normal input
      state.itemIds = state.itemIds.filter((i) => i !== ItemId.Coal);
      state.items[ItemId.Wood] = Rational.one;
      state.items[ItemId.Coal] = Rational.one;
      state.recipes = {
        [RecipeId.Coal]: Mocks.Dataset.recipeR[RecipeId.Coal],
      };
      SimplexUtility.parseInputs(state);
      expect(state.inputs).toEqual([ItemId.Wood, ItemId.Coal]);
    });
  });

  describe('getSolution', () => {
    it('should handle no solution found by simplex', () => {
      spyOn(SimplexUtility, 'canonical').and.returnValue([[Rational.one]]);
      spyOn(SimplexUtility, 'hash').and.returnValue(['O' as any, 'H']);
      spyOn(SimplexUtility, 'checkCache').and.returnValue(null);
      spyOn(SimplexUtility, 'simplex').and.returnValue([
        MatrixResultType.Failed,
        0,
        0,
      ]);
      spyOn(SimplexUtility, 'parseSolution');
      const state = getState();
      const result = SimplexUtility.getSolution(state);
      expect(SimplexUtility.canonical).toHaveBeenCalledWith(state);
      expect(SimplexUtility.simplex).toHaveBeenCalledWith(
        [[Rational.one]],
        true
      );
      expect(SimplexUtility.parseSolution).not.toHaveBeenCalled();
      expect(result[0]).toEqual(MatrixResultType.Failed);
    });

    it('should handle timeout and quit in simplex', () => {
      spyOn(SimplexUtility, 'canonical').and.returnValue([[Rational.one]]);
      spyOn(SimplexUtility, 'hash').and.returnValue(['O' as any, 'H']);
      spyOn(SimplexUtility, 'checkCache').and.returnValue(null);
      spyOn(SimplexUtility, 'simplex').and.returnValue([
        MatrixResultType.Cancelled,
        0,
        0,
      ]);
      spyOn(SimplexUtility, 'parseSolution');
      const state = getState();
      const result = SimplexUtility.getSolution(state);
      expect(SimplexUtility.canonical).toHaveBeenCalledWith(state);
      expect(SimplexUtility.simplex).toHaveBeenCalledWith(
        [[Rational.one]],
        true
      );
      expect(SimplexUtility.parseSolution).not.toHaveBeenCalled();
      expect(result[0]).toEqual(MatrixResultType.Cancelled);
    });

    it('should parse the solution found by simplex', () => {
      spyOn(SimplexUtility, 'canonical').and.returnValue([[Rational.one]]);
      spyOn(SimplexUtility, 'hash').and.returnValue(['O' as any, 'H']);
      spyOn(SimplexUtility, 'checkCache').and.returnValue(null);
      spyOn(SimplexUtility, 'simplex').and.returnValue([
        MatrixResultType.Solved,
        0,
        0,
      ]);
      spyOn(SimplexUtility, 'parseSolution').and.returnValue([{}, {}, {}]);
      const state = getState();
      const result = SimplexUtility.getSolution(state);
      expect(SimplexUtility.canonical).toHaveBeenCalledWith(state);
      expect(SimplexUtility.simplex).toHaveBeenCalledWith(
        [[Rational.one]],
        true
      );
      expect(SimplexUtility.parseSolution).toHaveBeenCalledWith(
        [Rational.one],
        state
      );
      expect(result[0]).toEqual(MatrixResultType.Solved);
    });

    it('should parse a solution from the cache', () => {
      spyOn(SimplexUtility, 'canonical').and.returnValue([[Rational.one]]);
      spyOn(SimplexUtility, 'hash').and.returnValue(['O' as any, 'H']);
      spyOn(SimplexUtility, 'checkCache').and.returnValue({
        O: [Rational.one],
        R: [Rational.two],
        pivots: 2,
        time: 20,
      });
      spyOn(SimplexUtility, 'parseSolution').and.returnValue([{}, {}, {}]);
      const state = getState();
      const result = SimplexUtility.getSolution(state);
      expect(SimplexUtility.canonical).toHaveBeenCalledWith(state);
      expect(SimplexUtility.parseSolution).toHaveBeenCalledWith(
        [Rational.two],
        state
      );
      expect(result[0]).toEqual(MatrixResultType.Cached);
    });
  });

  describe('canonical', () => {
    it('should get a canonical matrix', () => {
      const state = getState();
      // Coal = ignored input, Wood = normal input
      state.itemIds = state.itemIds.filter((i) => i !== ItemId.Coal);
      state.inputs = [ItemId.Wood, ItemId.Coal];
      state.recipes[RecipeId.CopperCable] =
        Mocks.AdjustedData.recipeR[RecipeId.CopperCable];
      state.recipes[ItemId.CopperPlate] = new RationalRecipe({
        id: 'id',
        name: 'name',
        time: 1,
        in: {},
        out: { [ItemId.CopperPlate]: 1 },
        producers: [],
      });
      state.recipes[ItemId.Water] = Mocks.AdjustedData.recipeR[RecipeId.Water];
      state.recipes[ItemId.IronOre] =
        Mocks.AdjustedData.recipeR[RecipeId.IronOre];
      state.items[ItemId.CopperCable] = Rational.one;
      state.items[ItemId.CopperPlate] = Rational.zero;
      state.items[ItemId.Wood] = Rational.zero;
      state.items[ItemId.Coal] = Rational.zero;
      const result = SimplexUtility.canonical(state);
      expect(result).toEqual([
        [
          Rational.one,
          Rational.minusOne,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
        ],
        [
          Rational.zero,
          Rational.from(154, 5),
          Rational.from(-11),
          Rational.zero,
          Rational.zero,
          Rational.one,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.one,
        ],
        [
          Rational.zero,
          Rational.zero,
          Rational.one,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.one,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
        ],
        [
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.one,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.from(120000),
        ],
        [
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.one,
          Rational.zero,
          Rational.zero,
          Rational.from(29575),
        ],
        [
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.one,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.one,
          Rational.zero,
          Rational.from(1000000),
        ],
        [
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.one,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.one,
          Rational.zero,
        ],
      ]);
    });
  });

  describe('simplex', () => {
    it('should solve a canonical tableau', () => {
      const A = getTableau();
      const result = SimplexUtility.simplex(A);
      expect(A).toEqual(getSolution());
      expect(result[0]).toEqual(MatrixResultType.Solved);
      expect(result[1]).toEqual(2);
    });

    it('should handle a failed pivot', () => {
      spyOn(SimplexUtility, 'pivotCol').and.returnValue(false);
      const result = SimplexUtility.simplex(getTableau());
      expect(result[0]).toEqual(MatrixResultType.Failed);
      expect(result[1]).toEqual(1);
    });

    it('should prompt on timeout and continue', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(Date, 'now').and.returnValues(0, 5001);
      const A = getTableau();
      const result = SimplexUtility.simplex(A);
      expect(A).toEqual(getSolution());
      expect(result[0]).toEqual(MatrixResultType.Solved);
      expect(result[1]).toEqual(2);
    });

    it('should prompt on timeout and quit', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(Date, 'now').and.returnValues(0, 5001);
      const result = SimplexUtility.simplex(getTableau());
      expect(result[0]).toEqual(MatrixResultType.Cancelled);
      expect(result[1]).toEqual(1);
    });

    it('should quit one timeout with error = false', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(Date, 'now').and.returnValues(0, 1001);
      const result = SimplexUtility.simplex(getTableau(), false);
      expect(result[0]).toEqual(MatrixResultType.Cancelled);
      expect(result[1]).toEqual(1);
    });
  });

  describe('pivotCol', () => {
    it('should pivot the correct row', () => {
      spyOn(SimplexUtility, 'pivot');
      const A = getTableau();
      SimplexUtility.pivotCol(A, 3);
      expect(SimplexUtility.pivot).toHaveBeenCalledWith(A, 3, 2);
    });

    it('should handle no positive rows', () => {
      spyOn(SimplexUtility, 'pivot');
      const A = getTableau();
      const result = SimplexUtility.pivotCol(A, 0);
      expect(SimplexUtility.pivot).not.toHaveBeenCalled();
      expect(result).toBeFalse();
    });

    it('should pivot the first correct row', () => {
      spyOn(SimplexUtility, 'pivot');
      const A = getTableau();
      SimplexUtility.pivotCol(A, 1);
      expect(SimplexUtility.pivot).toHaveBeenCalledWith(A, 1, 1);
    });
  });

  describe('pivot', () => {
    it('should pivot a column', () => {
      const A = getTableau();
      const result = SimplexUtility.pivot(A, 3, 2);
      expect(A).toEqual(getSolution());
      expect(result).toBeTrue();
    });
  });

  describe('parseSolution', () => {
    it('should parse the solution of the tableau', () => {
      const state = getState();
      state.items[ItemId.Coal] = Rational.zero;
      state.items[ItemId.IronOre] = Rational.zero;
      state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      state.recipes[RecipeId.IronOre] =
        Mocks.AdjustedData.recipeR[RecipeId.IronOre];
      state.inputs = [ItemId.Coal, ItemId.IronOre];
      const O = [
        Rational.one,
        Rational.zero,
        Rational.one,
        Rational.zero,
        Rational.two,
        Rational.one,
        Rational.zero,
        Rational.zero,
      ];
      const result = SimplexUtility.parseSolution(O, state);
      expect(result).toEqual([
        { [ItemId.IronOre]: Rational.one },
        { [RecipeId.IronOre]: Rational.two },
        { [ItemId.Coal]: Rational.one },
      ]);
    });
  });

  describe('updateSteps', () => {
    it('should walk through and update steps based on simplex result', () => {
      spyOn(SimplexUtility, 'addItemStep');
      spyOn(SimplexUtility, 'assignRecipes');
      spyOn(SimplexUtility, 'addRecipeStep');
      spyOn(SimplexUtility, 'updateParents');
      const state = getState();
      state.items[ItemId.Coal] = Rational.zero;
      state.items[ItemId.IronOre] = Rational.zero;
      state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      state.recipes[ItemId.Wood] = { id: null } as any;
      state.recipes[RecipeId.IronOre] =
        Mocks.AdjustedData.recipeR[RecipeId.IronOre];
      const solution: any = {
        surplus: { [ItemId.IronOre]: Rational.one },
        inputs: { [ItemId.Wood]: Rational.one },
        recipes: { [RecipeId.IronOre]: Rational.two },
      };
      SimplexUtility.updateSteps(Mocks.Steps, solution, state);
      expect(SimplexUtility.addItemStep).toHaveBeenCalledTimes(2);
      expect(SimplexUtility.assignRecipes).toHaveBeenCalledTimes(1);
      expect(SimplexUtility.addRecipeStep).toHaveBeenCalledTimes(1);
      expect(SimplexUtility.updateParents).toHaveBeenCalledTimes(1);
    });
  });

  describe('addItemStep', () => {
    it('should update an existing step with items', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: Rational.one,
      };
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: Rational.two },
      };
      const state = getState();
      state.items[ItemId.Coal] = Rational.from(3);
      state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      SimplexUtility.addItemStep(ItemId.Coal, [step], solution, state);
      expect(step).toEqual({
        id: 'id',
        itemId: ItemId.Coal,
        items: Rational.from(1183, 200),
      });
    });

    it('should add to an input step', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: Rational.one,
      };
      const solution: any = {
        surplus: {},
        inputs: { [ItemId.Coal]: Rational.two },
        recipes: {},
      };
      const state = getState();
      state.items[ItemId.Coal] = Rational.zero;
      state.recipes[ItemId.Coal] = new RationalRecipe({
        id: 'id',
        name: 'name',
        time: 1,
        in: {},
        out: { [ItemId.Coal]: 1 },
        producers: [],
      });
      SimplexUtility.addItemStep(ItemId.Coal, [step], solution, state);
      expect(step).toEqual({
        id: 'id',
        itemId: ItemId.Coal,
        items: Rational.from(3),
      });
    });

    it('should ignore an item with no output', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: Rational.one,
      };
      const solution: any = {
        surplus: { [ItemId.Coal]: Rational.zero },
        inputs: { [ItemId.Coal]: Rational.zero },
        recipes: { [RecipeId.Coal]: Rational.zero },
      };
      const state = getState();
      state.items[ItemId.Coal] = Rational.one;
      state.recipes[ItemId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      SimplexUtility.addItemStep(ItemId.Coal, [step], solution, state);
      expect(step).toEqual({
        id: 'id',
        itemId: ItemId.Coal,
        items: Rational.one,
      });
    });

    it('should add a new step', () => {
      const steps: Step[] = [];
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: Rational.two },
      };
      const state = getState();
      state.items[ItemId.Coal] = Rational.from(3);
      state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      SimplexUtility.addItemStep(ItemId.Coal, steps, solution, state);
      expect(steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Coal,
          items: Rational.from(1183, 200),
        },
      ]);
    });

    it('should place a new step next to related steps', () => {
      const steps: Step[] = [
        {
          id: '0',
          itemId: ItemId.PetroleumGas,
          items: Rational.zero,
        },
        {
          id: '1',
          itemId: ItemId.Wood,
          items: Rational.zero,
        },
      ];
      const solution: any = {
        surplus: {},
        inputs: { [ItemId.HeavyOil]: Rational.one },
        recipes: {},
      };
      const state = getState();
      state.recipes[RecipeId.AdvancedOilProcessing] =
        Mocks.AdjustedData.recipeR[RecipeId.AdvancedOilProcessing];
      SimplexUtility.addItemStep(ItemId.HeavyOil, steps, solution, state);
      expect(steps).toEqual([
        {
          id: '0',
          itemId: ItemId.PetroleumGas,
          items: Rational.zero,
        },
        {
          id: '2',
          itemId: ItemId.HeavyOil,
          items: Rational.one,
        },
        {
          id: '1',
          itemId: ItemId.Wood,
          items: Rational.zero,
        },
      ]);
    });

    it('should assign a surplus value', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
      };
      const solution: any = {
        surplus: { [ItemId.Coal]: Rational.from(3) },
        inputs: {},
        recipes: { [RecipeId.Coal]: Rational.from(4) },
      };
      const state = getState();
      state.items[ItemId.Coal] = Rational.zero;
      state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      SimplexUtility.addItemStep(ItemId.Coal, [step], solution, state);
      expect(step).toEqual({
        id: 'id',
        itemId: ItemId.Coal,
        items: Rational.from(1183, 100),
        surplus: Rational.from(3),
      });
    });

    it('should negate a surplus for a disabled item', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
      };
      const solution: any = {
        surplus: { [ItemId.Coal]: Rational.from(3) },
        inputs: {},
        recipes: { [RecipeId.Coal]: Rational.from(1) },
      };
      const state = getState();
      state.items[ItemId.Coal] = Rational.zero;
      state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      state.itemIds = state.itemIds.filter((i) => i !== ItemId.Coal);
      SimplexUtility.addItemStep(ItemId.Coal, [step], solution, state);
      expect(step).toEqual({
        id: 'id',
        itemId: ItemId.Coal,
        items: Rational.zero,
        surplus: Rational.from(17, 400),
      });
    });
  });

  describe('assignRecipes', () => {
    it('should assign recipes to appropriate steps', () => {
      const steps: Step[] = [
        {
          id: '0',
          itemId: ItemId.CopperCable,
          items: Rational.zero,
        },
        {
          id: '1',
          itemId: ItemId.HeavyOil,
          items: Rational.zero,
        },
        {
          id: '2',
          itemId: ItemId.PetroleumGas,
          items: Rational.zero,
        },
        {
          id: '3',
          itemId: ItemId.LightOil,
          items: Rational.zero,
        },
      ];
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: {
          [RecipeId.CopperCable]: Rational.one,
          [RecipeId.AdvancedOilProcessing]: Rational.one,
          [RecipeId.BasicOilProcessing]: Rational.one,
        },
      };
      const state = getState();
      state.recipes[RecipeId.CopperCable] =
        Mocks.AdjustedData.recipeR[RecipeId.CopperCable];
      state.recipes[RecipeId.AdvancedOilProcessing] =
        Mocks.AdjustedData.recipeR[RecipeId.AdvancedOilProcessing];
      state.recipes[RecipeId.BasicOilProcessing] =
        Mocks.AdjustedData.recipeR[RecipeId.BasicOilProcessing];
      SimplexUtility.assignRecipes(steps, solution, state);
      expect(steps).toEqual([
        {
          id: '0',
          itemId: ItemId.CopperCable,
          recipeId: RecipeId.CopperCable,
          items: Rational.zero,
        },
        {
          id: '1',
          itemId: ItemId.HeavyOil,
          recipeId: RecipeId.AdvancedOilProcessing,
          items: Rational.zero,
        },
        {
          id: '2',
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.BasicOilProcessing,
          items: Rational.zero,
        },
        {
          id: '3',
          itemId: ItemId.LightOil,
          items: Rational.zero,
        },
      ]);
    });
  });

  describe('addRecipeStep', () => {
    it('should update an existing step', () => {
      spyOn(RateUtility, 'adjustPowerPollution');
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: Rational.one,
      };
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: Rational.one },
      };
      SimplexUtility.addRecipeStep(
        Mocks.AdjustedData.recipeR[RecipeId.Coal],
        [step],
        solution
      );
      expect(RateUtility.adjustPowerPollution).toHaveBeenCalled();
      expect(step).toEqual({
        id: 'id',
        itemId: ItemId.Coal,
        recipeId: RecipeId.Coal,
        items: Rational.one,
        factories: Rational.one,
      });
    });

    it('should find a matching step by recipe existing step', () => {
      spyOn(RateUtility, 'adjustPowerPollution');
      const step: Step = {
        id: 'id',
        recipeId: RecipeId.Coal,
        items: Rational.one,
      };
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: Rational.one },
      };
      SimplexUtility.addRecipeStep(
        Mocks.AdjustedData.recipeR[RecipeId.Coal],
        [step],
        solution
      );
      expect(RateUtility.adjustPowerPollution).toHaveBeenCalled();
      expect(step).toEqual({
        id: 'id',
        recipeId: RecipeId.Coal,
        items: Rational.one,
        factories: Rational.one,
      });
    });

    it('should add a new step', () => {
      spyOn(RateUtility, 'adjustPowerPollution');
      const steps: Step[] = [];
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: Rational.one },
      };
      SimplexUtility.addRecipeStep(
        Mocks.AdjustedData.recipeR[RecipeId.Coal],
        steps,
        solution
      );
      expect(RateUtility.adjustPowerPollution).toHaveBeenCalled();
      expect(steps).toEqual([
        {
          id: '0',
          recipeId: RecipeId.Coal,
          factories: Rational.one,
        },
      ]);
    });

    it('should place a new step next to related steps', () => {
      spyOn(RateUtility, 'adjustPowerPollution');
      const steps: Step[] = [
        {
          id: '0',
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.BasicOilProcessing,
          items: Rational.zero,
        },
        {
          id: '1',
          itemId: ItemId.Wood,
          items: Rational.zero,
        },
      ];
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.AdvancedOilProcessing]: Rational.one },
      };
      SimplexUtility.addRecipeStep(
        Mocks.AdjustedData.recipeR[RecipeId.AdvancedOilProcessing],
        steps,
        solution
      );
      expect(RateUtility.adjustPowerPollution).toHaveBeenCalled();
      expect(steps).toEqual([
        {
          id: '0',
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.BasicOilProcessing,
          items: Rational.zero,
        },
        {
          id: '2',
          recipeId: RecipeId.AdvancedOilProcessing,
          factories: Rational.one,
        },
        { id: '1', itemId: ItemId.Wood, items: Rational.zero },
      ]);
    });
  });

  describe('updateParents', () => {
    it('should update parents for steps solved by matrix', () => {
      spyOn(RateUtility, 'addParentValue');
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: Rational.one,
      };
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.PlasticBar]: Rational.one },
      };
      const state = getState();
      state.recipes[RecipeId.PlasticBar] =
        Mocks.AdjustedData.recipeR[RecipeId.PlasticBar];
      SimplexUtility.updateParents([step], solution, state);
      expect(RateUtility.addParentValue).toHaveBeenCalledWith(
        step,
        RecipeId.PlasticBar,
        Rational.from(91, 20)
      );
    });
  });

  describe('hash', () => {
    it('should generate a hash of the tableau and objective', () => {
      const result = SimplexUtility.hash([
        [Rational.one],
        [Rational.one, Rational.two],
      ]);
      expect(result[0]).toEqual([Rational.one]);
      expect(result[1]).toEqual('1,2');
    });
  });

  describe('cacheResult', () => {
    it('should create a new cache entry', () => {
      SimplexUtility.cacheResult([Rational.one], 'H', [Rational.two], 2, 20);
      expect(SimplexUtility.cache).toEqual({
        H: [{ O: [Rational.one], R: [Rational.two], pivots: 2, time: 20 }],
      });
    });

    it('should add to an existing cache entry', () => {
      SimplexUtility.cache['H'] = ['old' as any];
      SimplexUtility.cacheResult([Rational.one], 'H', [Rational.two], 2, 20);
      expect(SimplexUtility.cache).toEqual({
        H: [
          'old' as any,
          { O: [Rational.one], R: [Rational.two], pivots: 2, time: 20 },
        ],
      });
    });
  });

  describe('checkCache', () => {
    it('should skip if no cache matches H', () => {
      expect(SimplexUtility.checkCache([Rational.one], 'H')).toBeNull();
    });

    it('should skip if ratio is null', () => {
      spyOn(SimplexUtility, 'objectiveRatio').and.returnValue(null);
      SimplexUtility.cache['H'] = ['cache' as any];
      expect(SimplexUtility.checkCache([Rational.one], 'H')).toBeNull();
    });

    it('should return cache entry if ratio is one', () => {
      spyOn(SimplexUtility, 'objectiveRatio').and.returnValue(Rational.one);
      SimplexUtility.cache['H'] = ['cache' as any];
      expect(SimplexUtility.checkCache([Rational.one], 'H')).toEqual(
        'cache' as any
      );
    });

    it('should adjust cache entry based on ratio', () => {
      spyOn(SimplexUtility, 'objectiveRatio').and.returnValue(Rational.two);
      SimplexUtility.cache['H'] = [
        { O: [Rational.one], R: [Rational.one], pivots: 2, time: 20 },
      ];
      expect(SimplexUtility.checkCache([Rational.one], 'H')).toEqual({
        O: [Rational.one],
        R: [Rational.two],
        pivots: 2,
        time: 20,
      });
    });
  });

  describe('objectiveRatio', () => {
    it('should check length first', () => {
      expect(SimplexUtility.objectiveRatio([], [Rational.one])).toBeNull();
    });

    it('should handle all zeroes', () => {
      expect(
        SimplexUtility.objectiveRatio(
          [Rational.one, Rational.zero],
          [Rational.one, Rational.zero]
        )
      ).toBeNull();
    });

    it('should handle zero/nonzero mismatches', () => {
      expect(
        SimplexUtility.objectiveRatio(
          [Rational.one, Rational.one],
          [Rational.one, Rational.zero]
        )
      ).toBeNull();
      expect(
        SimplexUtility.objectiveRatio(
          [Rational.one, Rational.zero],
          [Rational.one, Rational.one]
        )
      ).toBeNull();
    });

    it('should handle ratio mismatch', () => {
      expect(
        SimplexUtility.objectiveRatio(
          [Rational.one, Rational.one, Rational.one],
          [Rational.one, Rational.one, Rational.two]
        )
      ).toBeNull();
    });

    it('should handle ratio match', () => {
      expect(
        SimplexUtility.objectiveRatio(
          [Rational.one, Rational.one, Rational.one],
          [Rational.one, Rational.two, Rational.two]
        )
      ).toEqual(Rational.from(1, 2));
    });
  });
});
