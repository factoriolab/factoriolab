import { CategoryId, ItemId, Mocks, RecipeId } from 'src/tests';
import {
  ItemRtlObj,
  MatrixResultType,
  Rat,
  RateUnit,
  Rational,
  Recipe,
} from '~/models';
import { RateUtility } from './rate.utility';
import { MatrixSolution, MatrixState, SimplexUtility } from './simplex.utility';

describe('SimplexUtility', () => {
  const getState = (): MatrixState => ({
    itemObjectives: [],
    producers: [],
    steps: [],
    recipes: {},
    itemsOutput: {},
    unproduceableIds: [],
    recipeIds: Mocks.Dataset.recipeIds,
    itemIds: Mocks.Dataset.itemIds,
    data: Mocks.AdjustedData,
    costUnproduceable: Rational.from(1000000),
    costExcluded: Rational.zero,
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
  const getResult = (
    resultType: MatrixResultType = MatrixResultType.Solved
  ): MatrixSolution => ({
    resultType,
    surplus: {},
    recipes: {},
    unproduceable: {},
    pivots: 1,
    time: 2,
    A: [],
    O: [],
    itemIds: [],
    producers: [],
    recipeIds: [],
    unproduceableIds: [],
  });

  describe('solve', () => {
    it('should handle empty list of products', () => {
      expect(
        SimplexUtility.solve(
          [],
          [],
          {},
          [],
          Rational.zero,
          Rational.zero,
          Mocks.AdjustedData
        )
      ).toEqual({
        steps: [],
        resultType: MatrixResultType.Skipped,
      });
    });

    it('should handle timeout and quit in simplex method', () => {
      spyOn(SimplexUtility, 'getState').and.returnValue({
        steps: Mocks.Steps,
      } as any);
      spyOn(SimplexUtility, 'getSolution').and.returnValue(
        getResult(MatrixResultType.Cancelled)
      );
      expect(
        SimplexUtility.solve(
          Mocks.RationalProducts,
          [],
          {},
          [],
          Rational.zero,
          Rational.zero,
          SimplexType.JsBigIntRational,
          Mocks.AdjustedData
        )
      ).toEqual({
        steps: Mocks.Steps,
        resultType: MatrixResultType.Cancelled,
        pivots: 1,
        time: 2,
        A: [],
        O: [],
        itemIds: [],
        producers: [],
        recipeIds: [],
        unproduceableIds: [],
      });
    });

    it('should update steps with solution from simplex method', () => {
      spyOn(SimplexUtility, 'getState').and.returnValue({
        steps: Mocks.Steps,
      } as any);
      const result = getResult(MatrixResultType.Solved);
      spyOn(SimplexUtility, 'getSolution').and.returnValue(result);
      spyOn(SimplexUtility, 'updateSteps');
      expect(
        SimplexUtility.solve(
          Mocks.RationalProducts,
          [],
          {},
          [],
          Rational.zero,
          Rational.zero,
          SimplexType.JsBigIntRational,
          Mocks.AdjustedData
        )
      ).toEqual({
        steps: Mocks.Steps,
        resultType: MatrixResultType.Solved,
        pivots: 1,
        time: 2,
        A: [],
        O: [],
        itemIds: [],
        producers: [],
        recipeIds: [],
        unproduceableIds: [],
      });
      expect(SimplexUtility.updateSteps).toHaveBeenCalled();
    });

    it('should include heavy oil cracking', () => {
      const result = SimplexUtility.solve(
        [
          {
            id: '1',
            itemId: ItemId.PetroleumGas,
            rate: Rational.one,
            rateType: AmountType.Items,
          },
        ],
        [],
        Mocks.ItemSettingsInitial,
        [],
        Rational.from(1000000),
        Rational.zero,
        SimplexType.JsBigIntRational,
        Mocks.AdjustedData
      );
      const hocStep = result.steps.find(
        (s) => s.recipeId === RecipeId.HeavyOilCracking
      );
      expect(hocStep!.machines!.gt(Rational.zero)).toBeTrue();
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
          SimplexType.JsBigIntRational,
          Mocks.AdjustedData,
          false
        )
      ).toEqual([
        [ItemId.CopperPlate, Rational.one],
        [ItemId.CopperOre, Rational.from(5, 6)],
      ]);
    });

    it('should get recipe step information for an item', () => {
      expect(
        SimplexUtility.getSteps(
          ItemId.CopperPlate,
          Mocks.ItemSettingsInitial,
          [],
          Rational.from(1000000),
          Rational.zero,
          SimplexType.JsBigIntRational,
          Mocks.AdjustedData,
          true
        )
      ).toEqual([
        [ItemId.CopperPlate, Rational.from(40, 141)],
        [ItemId.CopperOre, Rational.from(1000, 3549)],
      ]);
    });
  });

  describe('getState', () => {
    it('should build full state object', () => {
      spyOn(SimplexUtility, 'parseItemRecursively');
      const result = SimplexUtility.getState(
        [Mocks.RationalProduct],
        [Mocks.RationalProducer],
        Mocks.ItemSettingsInitial,
        [],
        Rational.from(1000000),
        Rational.zero,
        SimplexType.JsBigIntRational,
        Mocks.Dataset
      );
      expect(result).toEqual({
        itemObjectives: [Mocks.RationalProduct],
        producers: [Mocks.RationalProducer],
        steps: [],
        recipes: {},
        itemsOutput: {
          [ItemId.WoodenChest]: Mocks.RationalProduct.rate,
          [ItemId.IronPlate]: Rational.zero,
          [ItemId.IronOre]: Rational.zero,
        },
        unproduceableIds: [
          ItemId.WoodenChest,
          ItemId.IronPlate,
          ItemId.IronOre,
        ],
        recipeIds: Mocks.Dataset.recipeIds,
        itemIds: Mocks.Dataset.itemIds,
        data: Mocks.Dataset,
        costUnproduceable: Rational.from(1000000),
        costExcluded: Rational.zero,
        simplexType: SimplexType.JsBigIntRational,
      });
    });

    it('should handle adjusted product', () => {
      const result = SimplexUtility.getState(
        [
          new ItemRtlObj({
            id: '1',
            itemId: ItemId.MiningProductivity,
            rate: '60',
            rateType: AmountType.Items,
          }),
        ],
        [],
        Mocks.ItemSettingsInitial,
        [],
        Rational.from(1000000),
        Rational.zero,
        SimplexType.JsBigIntRational,
        Mocks.AdjustedData
      );

      expect(result.itemsOutput[ItemId.MiningProductivity]).toEqual(
        Rational.from(72)
      );
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
      expect(state.itemsOutput).toEqual({
        [ItemId.CopperPlate]: Rational.zero,
      });
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
      expect(state.itemsOutput[ItemId.Coal]).toEqual(Rational.zero);
    });
  });

  describe('parseInputs', () => {
    it('should parse input-only items', () => {
      const state = getState();
      // Coal = excluded input, Wood = normal input
      state.itemIds = state.itemIds.filter((i) => i !== ItemId.Coal);
      state.itemsOutput[ItemId.Wood] = Rational.one;
      state.itemsOutput[ItemId.Coal] = Rational.one;
      state.recipes = {
        [RecipeId.Coal]: Mocks.Dataset.recipeR[RecipeId.Coal],
      };
      SimplexUtility.parseUnproduceable(state);
      expect(state.unproduceableIds).toEqual([ItemId.Wood, ItemId.Coal]);
    });
  });

  describe('getSolution', () => {
    it('should handle no solution found by simplex', () => {
      spyOn(SimplexUtility, 'canonical').and.returnValue([[Rational.one]]);
      spyOn(SimplexUtility, 'hash').and.returnValue(['O' as any, 'H']);
      spyOn(SimplexUtility, 'checkCache').and.returnValue(null);
      spyOn(SimplexUtility, 'simplex').and.returnValue({
        type: MatrixResultType.Failed,
        pivots: 0,
        time: 0,
        O: [],
      });
      spyOn(SimplexUtility, 'parseSolution');
      const state = getState();
      const result = SimplexUtility.getSolution(state);
      expect(SimplexUtility.canonical).toHaveBeenCalledWith(state);
      expect(SimplexUtility.simplex).toHaveBeenCalledWith(
        [[Rational.one]],
        true
      );
      expect(SimplexUtility.parseSolution).not.toHaveBeenCalled();
      expect(result.resultType).toEqual(MatrixResultType.Failed);
    });

    it('should handle timeout and quit in simplex', () => {
      spyOn(SimplexUtility, 'canonical').and.returnValue([[Rational.one]]);
      spyOn(SimplexUtility, 'hash').and.returnValue(['O' as any, 'H']);
      spyOn(SimplexUtility, 'checkCache').and.returnValue(null);
      spyOn(SimplexUtility, 'simplex').and.returnValue({
        type: MatrixResultType.Cancelled,
        pivots: 0,
        time: 0,
        O: [],
      });
      spyOn(SimplexUtility, 'parseSolution');
      const state = getState();
      const result = SimplexUtility.getSolution(state);
      expect(SimplexUtility.canonical).toHaveBeenCalledWith(state);
      expect(SimplexUtility.simplex).toHaveBeenCalledWith(
        [[Rational.one]],
        true
      );
      expect(SimplexUtility.parseSolution).not.toHaveBeenCalled();
      expect(result.resultType).toEqual(MatrixResultType.Cancelled);
    });

    it('should parse the solution found by simplex', () => {
      spyOn(SimplexUtility, 'canonical').and.returnValue([[Rational.one]]);
      spyOn(SimplexUtility, 'hash').and.returnValue(['O' as any, 'H']);
      spyOn(SimplexUtility, 'checkCache').and.returnValue(null);
      spyOn(SimplexUtility, 'simplex').and.returnValue({
        type: MatrixResultType.Solved,
        pivots: 0,
        time: 0,
        O: [Rational.one],
      });
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
      expect(result.resultType).toEqual(MatrixResultType.Solved);
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
      expect(result.resultType).toEqual(MatrixResultType.Cached);
    });

    it('should handle glpk failure', () => {
      spyOn(SimplexUtility, 'glpk').and.returnValue({ error: true } as any);
      const state = getState();
      const result = SimplexUtility.getSolution(state);
      expect(result.resultType).toEqual(MatrixResultType.Failed);
    });
  });

  describe('glpk', () => {
    it('should run the glpk wasm module to presolve', () => {
      const state = getState();
      // Coal = excluded input, Wood = normal input
      state.itemIds = state.itemIds.filter((i) => i !== ItemId.Coal);
      state.unproduceableIds = [ItemId.Wood, ItemId.Coal, ItemId.IronOre];
      state.recipes[RecipeId.CopperPlate] = new RecipeRat({
        id: 'id',
        name: 'name',
        time: 1,
        in: {},
        out: { [ItemId.CopperPlate]: 1 },
        producers: [],
        row: 0,
        category: CategoryId.Logistics,
      });
      state.recipes[RecipeId.IronPlate] =
        Mocks.Dataset.recipeR[RecipeId.IronPlate];
      state.itemsOutput[ItemId.Wood] = Rational.one;
      state.itemsOutput[ItemId.Coal] = Rational.one;
      state.itemsOutput[ItemId.IronPlate] = Rational.zero;
      state.itemsOutput[ItemId.IronOre] = Rational.zero;
      state.producers = [
        {
          id: '0',
          recipeId: RecipeId.IronPlate,
          count: Rational.one,
          recipe: Mocks.Dataset.recipeR[RecipeId.IronPlate],
        },
      ];
      const result = SimplexUtility.glpk(state);
      expect(result.returnCode).toEqual('ok');
      expect(result.status).toEqual('optimal');
    });

    it('should handle glpk failure', () => {
      spyOn(SimplexUtility, 'glpkSimplex').and.returnValue([
        'failure',
        'infeasible',
      ]);
      const state = getState();
      const result = SimplexUtility.glpk(state);
      expect(result.returnCode).toEqual('failure');
    });
  });

  describe('canonical', () => {
    it('should get a canonical matrix', () => {
      const state = getState();
      // Coal = excluded input, Wood = normal input
      state.itemIds = state.itemIds.filter((i) => i !== ItemId.Coal);
      state.unproduceableIds = [ItemId.Wood, ItemId.Coal];
      state.recipes[RecipeId.CopperCable] =
        Mocks.AdjustedData.recipeR[RecipeId.CopperCable];
      state.recipes[ItemId.CopperPlate] = new RecipeRat({
        id: 'id',
        name: 'name',
        time: 1,
        in: {},
        out: { [ItemId.CopperPlate]: 1 },
        producers: [],
        row: 0,
        category: CategoryId.Logistics,
      });
      state.recipes[ItemId.Water] = Mocks.AdjustedData.recipeR[RecipeId.Water];
      state.recipes[ItemId.IronOre] =
        Mocks.AdjustedData.recipeR[RecipeId.IronOre];
      state.itemsOutput[ItemId.CopperCable] = Rational.one;
      state.itemsOutput[ItemId.CopperPlate] = Rational.zero;
      state.itemsOutput[ItemId.Wood] = Rational.zero;
      state.itemsOutput[ItemId.Coal] = Rational.zero;
      state.itemsOutput[ItemId.IronOre] = Rational.zero;
      state.itemsOutput[ItemId.IronPlate] = Rational.zero;
      const alt = { ...Mocks.RationalProducer, ...{ id: '2' } };
      state.producers = [Mocks.RationalProducer, alt];
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
          Rational.minusOne,
          Rational.one,
          Rational.minusOne,
          Rational.one,
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
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.from(-5, 16),
          Rational.from(5, 16),
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
        ],
        [
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.zero,
          Rational.from(-5, 16),
          Rational.from(5, 16),
          Rational.zero,
          Rational.zero,
          Rational.one,
          Rational.minusOne,
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
          Rational.zero,
          Rational.zero,
          Rational.one,
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
          Rational.from(1183, 400),
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
          Rational.zero,
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
          Rational.zero,
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

  describe('simplexType', () => {
    it('should return presolve result', () => {
      const result = SimplexUtility.simplexType([[]], SimplexType.WasmFloat64, {
        returnCode: 'ok',
        status: 'optimal',
        error: false,
        time: 0,
        O: [],
      });
      expect(result.type).toEqual(MatrixResultType.Solved);
    });
  });

  describe('simplex', () => {
    it('should solve a canonical tableau', () => {
      const A = getTableau();
      const result = SimplexUtility.simplex(A);
      expect(A).toEqual(getSolution());
      expect(result.type).toEqual(MatrixResultType.Solved);
      expect(result.pivots).toEqual(2);
    });

    it('should handle a failed pivot', () => {
      spyOn(SimplexUtility, 'pivotCol').and.returnValue(false);
      const result = SimplexUtility.simplex(getTableau());
      expect(result.type).toEqual(MatrixResultType.Failed);
      expect(result.pivots).toEqual(1);
    });

    it('should prompt on timeout and continue', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(Date, 'now').and.returnValues(0, 5001);
      const A = getTableau();
      const result = SimplexUtility.simplex(A);
      expect(A).toEqual(getSolution());
      expect(result.type).toEqual(MatrixResultType.Solved);
      expect(result.pivots).toEqual(2);
    });

    it('should prompt on timeout and quit', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(Date, 'now').and.returnValues(0, 5001);
      const result = SimplexUtility.simplex(getTableau());
      expect(result.type).toEqual(MatrixResultType.Cancelled);
      expect(result.pivots).toEqual(1);
    });

    it('should quit one timeout with error = false', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(Date, 'now').and.returnValues(0, 1001);
      const result = SimplexUtility.simplex(getTableau(), false);
      expect(result.type).toEqual(MatrixResultType.Cancelled);
      expect(result.pivots).toEqual(1);
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
      state.itemsOutput[ItemId.Coal] = Rational.zero;
      state.itemsOutput[ItemId.IronOre] = Rational.zero;
      state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      state.recipes[RecipeId.IronOre] =
        Mocks.AdjustedData.recipeR[RecipeId.IronOre];
      state.unproduceableIds = [ItemId.Coal, ItemId.IronOre];
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
      const state = getState();
      state.itemsOutput[ItemId.Coal] = Rational.zero;
      state.itemsOutput[ItemId.IronOre] = Rational.zero;
      state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      state.recipes[ItemId.Wood] = { id: null } as any;
      state.recipes[RecipeId.IronOre] =
        Mocks.AdjustedData.recipeR[RecipeId.IronOre];
      state.producers = [Mocks.RationalProducer];
      const solution: any = {
        surplus: { [ItemId.IronOre]: Rational.one },
        inputs: { [ItemId.Wood]: Rational.one },
        recipes: { [RecipeId.IronOre]: Rational.two },
      };
      SimplexUtility.updateSteps(solution, state);
      expect(SimplexUtility.addItemStep).toHaveBeenCalledTimes(2);
      expect(SimplexUtility.assignRecipes).toHaveBeenCalledTimes(1);
      expect(SimplexUtility.addRecipeStep).toHaveBeenCalledTimes(2);
    });
  });

  describe('addItemStep', () => {
    it('should add a new step', () => {
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: Rational.two },
      };
      const state = getState();
      state.itemsOutput[ItemId.Coal] = Rational.from(3);
      state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      state.producers = [Mocks.RationalProducer];
      SimplexUtility.addItemStep(ItemId.Coal, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Coal,
          items: Rational.from(1183, 200),
          output: Rational.from(3),
        },
      ]);
    });

    it('should include producer output a new step', () => {
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: {},
      };
      const state = getState();
      state.itemsOutput[ItemId.IronPlate] = Rational.zero;
      state.producers = [Mocks.RationalProducer];
      SimplexUtility.addItemStep(ItemId.IronPlate, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.IronPlate,
          items: Rational.from(5, 16),
        },
      ]);
    });

    it('should place a new step next to related steps', () => {
      const solution: any = {
        surplus: {},
        inputs: { [ItemId.HeavyOil]: Rational.one },
        recipes: {},
      };
      const state = getState();
      state.steps = [
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
      state.itemsOutput[ItemId.HeavyOil] = Rational.zero;
      state.recipes[RecipeId.AdvancedOilProcessing] =
        Mocks.AdjustedData.recipeR[RecipeId.AdvancedOilProcessing];
      SimplexUtility.addItemStep(ItemId.HeavyOil, solution, state);
      expect(state.steps).toEqual([
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
      const solution: any = {
        surplus: { [ItemId.Coal]: Rational.from(3) },
        inputs: {},
        recipes: { [RecipeId.Coal]: Rational.from(4) },
      };
      const state = getState();
      state.itemsOutput[ItemId.Coal] = Rational.zero;
      state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      SimplexUtility.addItemStep(ItemId.Coal, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Coal,
          items: Rational.from(1183, 100),
          surplus: Rational.from(3),
        },
      ]);
    });

    it('should include surplus from non-default recipes', () => {
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: Rational.two },
      };
      const state = getState();
      state.data = Mocks.getDataset();
      state.data.itemRecipeId[ItemId.Coal] = 'other';
      state.itemsOutput[ItemId.Coal] = Rational.from(3);
      state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      state.producers = [Mocks.RationalProducer];
      SimplexUtility.addItemStep(ItemId.Coal, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Coal,
          items: Rational.from(1183, 200),
          surplus: Rational.from(1183, 200),
          output: Rational.from(3),
        },
      ]);
    });
  });

  describe('assignRecipes', () => {
    it('should assign recipes to appropriate steps', () => {
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
      state.steps = [
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
      state.recipes[RecipeId.CopperCable] =
        Mocks.AdjustedData.recipeR[RecipeId.CopperCable];
      state.recipes[RecipeId.AdvancedOilProcessing] =
        Mocks.AdjustedData.recipeR[RecipeId.AdvancedOilProcessing];
      state.recipes[RecipeId.BasicOilProcessing] =
        Mocks.AdjustedData.recipeR[RecipeId.BasicOilProcessing];
      state.producers = [Mocks.RationalProducer];
      SimplexUtility.assignRecipes(solution, state);
      expect(state.steps).toEqual([
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
      const state = getState();
      state.steps = [
        {
          id: 'id',
          itemId: ItemId.Coal,
          items: Rational.one,
        },
      ];
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: Rational.one },
      };
      SimplexUtility.addRecipeStep(
        Mocks.AdjustedData.recipeR[RecipeId.Coal],
        solution,
        state
      );
      expect(RateUtility.adjustPowerPollution).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: 'id',
          itemId: ItemId.Coal,
          recipeId: RecipeId.Coal,
          items: Rational.one,
          machines: Rational.one,
          recipe: Mocks.AdjustedData.recipeR[RecipeId.Coal],
        },
      ]);
    });

    it('should add a new step', () => {
      spyOn(RateUtility, 'adjustPowerPollution');
      const state = getState();
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: Rational.one },
      };
      SimplexUtility.addRecipeStep(
        Mocks.AdjustedData.recipeR[RecipeId.Coal],
        solution,
        state
      );
      expect(RateUtility.adjustPowerPollution).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: '0',
          recipeId: RecipeId.Coal,
          machines: Rational.one,
          recipe: Mocks.AdjustedData.recipeR[RecipeId.Coal],
        },
      ]);
    });

    it('should add a producer step', () => {
      spyOn(RateUtility, 'adjustPowerPollution');
      const state = getState();
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: Rational.one },
      };
      SimplexUtility.addRecipeStep(
        Mocks.AdjustedData.recipeR[RecipeId.Coal],
        solution,
        state,
        Mocks.RationalProducer
      );
      expect(RateUtility.adjustPowerPollution).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: '0',
          recipeId: RecipeId.Coal,
          machines: Rational.one,
          recipe: Mocks.AdjustedData.recipeR[RecipeId.Coal],
          recipeObjectiveId: Mocks.RationalProducer.id,
        },
      ]);
    });

    it('should place a new step next to related steps', () => {
      spyOn(RateUtility, 'adjustPowerPollution');
      const state = getState();
      state.steps = [
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
        solution,
        state
      );
      expect(RateUtility.adjustPowerPollution).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.BasicOilProcessing,
          items: Rational.zero,
        },
        {
          id: '2',
          recipeId: RecipeId.AdvancedOilProcessing,
          machines: Rational.one,
          recipe: Mocks.AdjustedData.recipeR[RecipeId.AdvancedOilProcessing],
        },
        { id: '1', itemId: ItemId.Wood, items: Rational.zero },
      ]);
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
      SimplexUtility.cacheResult([Rational.one], 'H', {
        type: MatrixResultType.Solved,
        O: [Rational.two],
        pivots: 2,
        time: 20,
      });
      expect(SimplexUtility.cache).toEqual({
        H: [{ O: [Rational.one], R: [Rational.two], pivots: 2, time: 20 }],
      });
    });

    it('should add to an existing cache entry', () => {
      SimplexUtility.cache['H'] = ['old' as any];
      SimplexUtility.cacheResult([Rational.one], 'H', {
        type: MatrixResultType.Solved,
        O: [Rational.two],
        pivots: 2,
        time: 20,
      });
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
