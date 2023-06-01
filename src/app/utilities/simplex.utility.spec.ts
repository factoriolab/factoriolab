import { ItemId, Mocks, RecipeId } from 'src/tests';
import {
  Entities,
  MatrixResultType,
  MaximizeType,
  ObjectiveType,
  ObjectiveUnit,
  Rational,
} from '~/models';
import { RateUtility } from './rate.utility';
import {
  ItemValues,
  MatrixSolution,
  MatrixState,
  SimplexUtility,
} from './simplex.utility';

describe('SimplexUtility', () => {
  const getState = (): MatrixState => ({
    objectives: [],
    recipeObjectives: [],
    steps: [],
    recipes: {},
    itemValues: {},
    recipeLimits: {},
    unproduceableIds: [],
    excludedIds: [],
    recipeIds: Mocks.Dataset.recipeIds,
    itemIds: Mocks.Dataset.itemIds,
    data: Mocks.AdjustedData,
    maximizeType: MaximizeType.Weight,
    cost: {
      factor: Rational.one,
      machine: Rational.one,
      unproduceable: Rational.from(1000000),
      excluded: Rational.zero,
      surplus: Rational.zero,
      maximize: Rational.from(-1000000),
    },
  });
  const getResult = (
    resultType: MatrixResultType = MatrixResultType.Solved
  ): MatrixSolution => ({
    resultType,
    time: 2,
    cost: Rational.one,
    itemIds: [],
    recipeIds: [],
    unproduceableIds: [],
    excludedIds: [],
    surplus: {},
    unproduceable: {},
    excluded: {},
    recipes: {},
  });

  describe('addItemValue', () => {
    it('should add a value to an entity of Rationals', () => {
      const result: Entities<ItemValues> = {};
      SimplexUtility.addItemValue(result, 'id');
      expect(result['id'].out).toEqual(Rational.zero);
      SimplexUtility.addItemValue(result, 'id', Rational.one);
      expect(result['id'].out).toEqual(Rational.one);
      SimplexUtility.addItemValue(result, 'id', Rational.two, 'lim');
      expect(result['id'].lim).toEqual(Rational.two);
    });
  });

  describe('solve', () => {
    it('should handle empty list of objectives', () => {
      expect(
        SimplexUtility.solve(
          [],
          {},
          {},
          [],
          MaximizeType.Weight,
          Mocks.CostRational,
          Mocks.AdjustedData
        )
      ).toEqual({
        steps: [],
        resultType: MatrixResultType.Skipped,
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
          Mocks.RationalObjectives,
          {},
          {},
          null,
          MaximizeType.Weight,
          Mocks.CostRational,
          Mocks.AdjustedData
        )
      ).toEqual({
        steps: Mocks.Steps,
        resultType: MatrixResultType.Solved,
        returnCode: undefined,
        simplexStatus: undefined,
        time: 2,
        cost: Rational.one,
      });
      expect(SimplexUtility.updateSteps).toHaveBeenCalled();
    });
  });

  describe('getState', () => {
    it('should build full state object', () => {
      spyOn(SimplexUtility, 'parseItemRecursively');
      const result = SimplexUtility.getState(
        Mocks.RationalObjectives,
        Mocks.ItemsStateInitial,
        Mocks.RecipesState,
        Mocks.Dataset.technologyIds,
        MaximizeType.Weight,
        Mocks.CostRational,
        Mocks.Dataset
      );
      expect(result).toEqual({
        objectives: Mocks.RationalObjectives,
        recipeObjectives: [],
        steps: [],
        recipes: {},
        itemValues: {
          [ItemId.AdvancedCircuit]: { out: Rational.one },
          [ItemId.IronPlate]: { out: Rational.zero, in: Rational.one },
          [ItemId.PlasticBar]: { out: Rational.zero, max: Rational.one },
          [ItemId.PiercingRoundsMagazine]: { out: Rational.zero },
          [ItemId.FirearmMagazine]: { out: Rational.zero },
          [ItemId.SteelPlate]: { out: Rational.zero },
          [ItemId.CopperPlate]: {
            out: Rational.zero,
            in: Rational.from([5, 16]),
          },
          [ItemId.PetroleumGas]: { out: Rational.zero, lim: Rational.hundred },
        },
        recipeLimits: { [RecipeId.IronPlate]: Rational.ten },
        unproduceableIds: [
          ItemId.AdvancedCircuit,
          ItemId.IronPlate,
          ItemId.PlasticBar,
          ItemId.PetroleumGas,
          ItemId.PiercingRoundsMagazine,
          ItemId.FirearmMagazine,
          ItemId.SteelPlate,
          ItemId.CopperPlate,
        ],
        excludedIds: [],
        recipeIds: Mocks.Dataset.recipeIds,
        itemIds: Mocks.Dataset.itemIds,
        data: Mocks.Dataset,
        maximizeType: MaximizeType.Weight,
        cost: Mocks.CostRational,
      });
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
      expect(state.itemValues[ItemId.CopperPlate].out).toEqual(Rational.zero);
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
      expect(state.itemValues[ItemId.Coal].out).toEqual(Rational.zero);
    });
  });

  describe('parseUnproduceable', () => {
    it('should parse unproduceable items', () => {
      const state = getState();
      state.itemValues[ItemId.Wood] = { out: Rational.one };
      state.itemValues[ItemId.Coal] = { out: Rational.one };
      state.recipes = {
        [RecipeId.Coal]: Mocks.Dataset.recipeR[RecipeId.Coal],
      };
      SimplexUtility.parseUnproduceable(state);
      expect(state.unproduceableIds).toEqual([ItemId.Wood]);
    });
  });

  describe('getSolution', () => {
    it('should parse the solution found by simplex', () => {
      spyOn(SimplexUtility, 'glpk').and.returnValue({} as any);
      const state = getState();
      const result = SimplexUtility.getSolution(state);
      expect(result.resultType).toEqual(MatrixResultType.Solved);
    });

    it('should handle glpk failure', () => {
      spyOn(SimplexUtility, 'glpk').and.returnValue({ error: true } as any);
      const state = getState();
      const result = SimplexUtility.getSolution(state);
      expect(result.resultType).toEqual(MatrixResultType.Failed);
    });
  });

  describe('glpk', () => {
    it('should find a solution using glpk', () => {
      const state = getState();
      // Coal = excluded input, Wood = normal input
      state.itemIds = state.itemIds.filter((i) => i !== ItemId.Coal);
      state.unproduceableIds = [ItemId.Wood, ItemId.Coal, ItemId.IronOre];
      state.excludedIds = [ItemId.CopperOre];
      state.recipes[RecipeId.CopperPlate] =
        Mocks.Dataset.recipeR[RecipeId.CopperPlate];
      state.recipes[RecipeId.IronPlate] =
        Mocks.Dataset.recipeR[RecipeId.IronPlate];
      state.itemValues[ItemId.Wood] = {
        out: Rational.one,
      };
      state.itemValues[ItemId.Coal] = { out: Rational.one };
      state.itemValues[ItemId.IronPlate] = {
        out: Rational.zero,
        max: Rational.one,
      };
      state.itemValues[ItemId.IronOre] = {
        out: Rational.zero,
        in: Rational.one,
        lim: Rational.ten,
      };
      state.itemValues[ItemId.CopperCable] = { out: Rational.zero };
      state.itemValues[ItemId.CopperPlate] = { out: Rational.zero };
      state.itemValues[ItemId.CopperOre] = { out: Rational.zero };
      state.recipeLimits[RecipeId.CopperPlate] = Rational.ten;
      state.recipeObjectives = [
        {
          id: '0',
          targetId: RecipeId.IronPlate,
          value: Rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          recipe: Mocks.Dataset.recipeR[RecipeId.IronPlate],
        },
        {
          id: '1',
          targetId: RecipeId.CopperCable,
          value: Rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Maximize,
          recipe: Mocks.Dataset.recipeR[RecipeId.CopperCable],
        },
      ];
      const result = SimplexUtility.glpk(state);
      expect(result.returnCode).toEqual('ok');
      expect(result.status).toEqual('optimal');
    });

    it('should find a solution using glpk maximizing by ratio', () => {
      const state = getState();
      state.maximizeType = MaximizeType.Ratio;
      // Coal = excluded input, Wood = normal input
      state.itemIds = state.itemIds.filter((i) => i !== ItemId.Coal);
      state.unproduceableIds = [ItemId.Wood, ItemId.Coal, ItemId.IronOre];
      state.excludedIds = [ItemId.CopperOre];
      state.recipes[RecipeId.CopperPlate] =
        Mocks.Dataset.recipeR[RecipeId.CopperPlate];
      state.recipes[RecipeId.IronPlate] =
        Mocks.Dataset.recipeR[RecipeId.IronPlate];
      state.itemValues[ItemId.Wood] = {
        out: Rational.one,
      };
      state.itemValues[ItemId.Coal] = { out: Rational.one };
      state.itemValues[ItemId.IronPlate] = {
        out: Rational.zero,
        max: Rational.one,
      };
      state.itemValues[ItemId.IronOre] = {
        out: Rational.zero,
        in: Rational.one,
        lim: Rational.ten,
      };
      state.itemValues[ItemId.CopperCable] = { out: Rational.zero };
      state.itemValues[ItemId.CopperPlate] = { out: Rational.zero };
      state.itemValues[ItemId.CopperOre] = { out: Rational.zero };
      state.recipeLimits[RecipeId.CopperPlate] = Rational.ten;
      state.recipeObjectives = [
        {
          id: '0',
          targetId: RecipeId.IronPlate,
          value: Rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          recipe: Mocks.Dataset.recipeR[RecipeId.IronPlate],
        },
        {
          id: '1',
          targetId: RecipeId.CopperCable,
          value: Rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Maximize,
          recipe: Mocks.Dataset.recipeR[RecipeId.CopperCable],
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

  // describe('updateSteps', () => {
  // it('should walk through and update steps based on simplex result', () => {
  //   spyOn(SimplexUtility, 'addItemStep');
  //   spyOn(SimplexUtility, 'assignRecipes');
  //   spyOn(SimplexUtility, 'addRecipeStep');
  //   const state = getState();
  //   state.itemValues[ItemId.Coal] = { out: Rational.zero };
  //   state.itemValues[ItemId.IronOre] = { out: Rational.zero };
  //   state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
  //   state.recipes[ItemId.Wood] = { id: null } as any;
  //   state.recipes[RecipeId.IronOre] =
  //     Mocks.AdjustedData.recipeR[RecipeId.IronOre];
  //   state.recipeObjectives = [Mocks.RationalRecipeObjective];
  //   const solution: any = {
  //     surplus: { [ItemId.IronOre]: Rational.one },
  //     inputs: { [ItemId.Wood]: Rational.one },
  //     recipes: { [RecipeId.IronOre]: Rational.two },
  //   };
  //   state.steps = [
  //     { id: '0' },
  //     { id: '1', output: Rational.one },
  //     { id: '2' },
  //     { id: '3', output: Rational.one },
  //   ];
  //   SimplexUtility.updateSteps(solution, state);
  //   expect(SimplexUtility.addItemStep).toHaveBeenCalledTimes(2);
  //   expect(SimplexUtility.assignRecipes).toHaveBeenCalledTimes(1);
  //   expect(SimplexUtility.addRecipeStep).toHaveBeenCalledTimes(2);
  // });
  // });

  describe('addItemStep', () => {
    // it('should add a new step', () => {
    //   const solution: any = {
    //     surplus: {},
    //     unproduceable: {},
    //     excluded: {},
    //     recipes: { [RecipeId.Coal]: Rational.two },
    //   };
    //   const state = getState();
    //   state.itemValues[ItemId.Coal] = { out: Rational.from(3) };
    //   state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
    //   state.recipeObjectives = [Mocks.RationalRecipeObjective];
    //   SimplexUtility.addItemStep(ItemId.Coal, solution, state);
    //   expect(state.steps).toEqual([
    //     {
    //       id: '0',
    //       itemId: ItemId.Coal,
    //       items: Rational.from([1183, 200]),
    //       output: Rational.from(3),
    //       parents: { '': Rational.from(3) },
    //     },
    //   ]);
    // });

    // it('should include recipe objective output a new step', () => {
    //   const solution: any = {
    //     surplus: {},
    //     unproduceable: {},
    //     excluded: {},
    //     recipes: {},
    //   };
    //   const state = getState();
    //   state.itemValues[ItemId.PiercingRoundsMagazine] = { out: Rational.zero };
    //   state.recipeObjectives = [Mocks.RationalRecipeObjective];
    //   SimplexUtility.addItemStep(
    //     ItemId.PiercingRoundsMagazine,
    //     solution,
    //     state
    //   );
    //   expect(state.steps).toEqual([
    //     {
    //       id: '0',
    //       itemId: ItemId.PiercingRoundsMagazine,
    //       items: Rational.from([1, 3]),
    //     },
    //   ]);
    // });

    it('should place a new step next to related steps', () => {
      const solution: any = {
        surplus: {},
        unproduceable: { [ItemId.HeavyOil]: Rational.one },
        excluded: { [ItemId.HeavyOil]: Rational.one },
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
      state.itemValues[ItemId.HeavyOil] = { out: Rational.zero };
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
          items: Rational.two,
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
        unproduceable: {},
        excluded: {},
        recipes: { [RecipeId.Coal]: Rational.from(4) },
      };
      const state = getState();
      state.itemValues[ItemId.Coal] = { out: Rational.zero };
      state.recipes[RecipeId.Coal] = Mocks.AdjustedData.recipeR[RecipeId.Coal];
      SimplexUtility.addItemStep(ItemId.Coal, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Coal,
          items: Rational.from([1183, 100]),
          surplus: Rational.from(3),
        },
      ]);
    });

    it('should include input values', () => {
      const solution: any = {
        surplus: {},
        unproduceable: {},
        excluded: {},
        recipes: {},
      };
      const state = getState();
      state.itemValues[ItemId.Coal] = { out: Rational.zero, in: Rational.one };
      SimplexUtility.addItemStep(ItemId.Coal, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Coal,
          items: Rational.one,
        },
      ]);
    });
  });

  // describe('assignRecipes', () => {
  //   it('should assign recipes to appropriate steps', () => {
  //     const solution: any = {
  //       surplus: {},
  //       unproduceable: {},
  //       excluded: {},
  //       recipes: {
  //         [RecipeId.CopperCable]: Rational.one,
  //         [RecipeId.AdvancedOilProcessing]: Rational.one,
  //         [RecipeId.BasicOilProcessing]: Rational.one,
  //       },
  //     };
  //     const state = getState();
  //     state.steps = [
  //       {
  //         id: '0',
  //         itemId: ItemId.CopperCable,
  //         items: Rational.zero,
  //       },
  //       {
  //         id: '1',
  //         itemId: ItemId.HeavyOil,
  //         items: Rational.zero,
  //       },
  //       {
  //         id: '2',
  //         itemId: ItemId.PetroleumGas,
  //         items: Rational.zero,
  //       },
  //       {
  //         id: '3',
  //         itemId: ItemId.LightOil,
  //         items: Rational.zero,
  //       },
  //     ];
  //     state.recipes[RecipeId.CopperCable] =
  //       Mocks.AdjustedData.recipeR[RecipeId.CopperCable];
  //     state.recipes[RecipeId.AdvancedOilProcessing] =
  //       Mocks.AdjustedData.recipeR[RecipeId.AdvancedOilProcessing];
  //     state.recipes[RecipeId.BasicOilProcessing] =
  //       Mocks.AdjustedData.recipeR[RecipeId.BasicOilProcessing];
  //     state.recipeObjectives = [Mocks.RationalRecipeObjective];
  //     SimplexUtility.assignRecipes(solution, state);
  //     expect(state.steps).toEqual([
  //       {
  //         id: '0',
  //         itemId: ItemId.CopperCable,
  //         recipeId: RecipeId.CopperCable,
  //         items: Rational.zero,
  //       },
  //       {
  //         id: '1',
  //         itemId: ItemId.HeavyOil,
  //         recipeId: RecipeId.AdvancedOilProcessing,
  //         items: Rational.zero,
  //       },
  //       {
  //         id: '2',
  //         itemId: ItemId.PetroleumGas,
  //         recipeId: RecipeId.BasicOilProcessing,
  //         items: Rational.zero,
  //       },
  //       {
  //         id: '3',
  //         itemId: ItemId.LightOil,
  //         items: Rational.zero,
  //       },
  //     ]);
  //   });
  // });

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

    // it('should add a recipe objective step', () => {
    //   spyOn(RateUtility, 'adjustPowerPollution');
    //   const state = getState();
    //   const solution: any = {
    //     surplus: {},
    //     inputs: {},
    //     recipes: { [RecipeId.Coal]: Rational.one },
    //   };
    //   SimplexUtility.addRecipeStep(
    //     Mocks.AdjustedData.recipeR[RecipeId.Coal],
    //     solution,
    //     state,
    //     Mocks.RationalRecipeObjective
    //   );
    //   expect(RateUtility.adjustPowerPollution).toHaveBeenCalled();
    //   expect(state.steps).toEqual([
    //     {
    //       id: '0',
    //       recipeId: RecipeId.Coal,
    //       machines: Rational.one,
    //       recipe: Mocks.AdjustedData.recipeR[RecipeId.Coal],
    //       recipeObjectiveId: Mocks.RationalRecipeObjective.id,
    //     },
    //   ]);
    // });

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
});
