import { ItemId, Mocks, RecipeId } from 'src/tests';
import {
  Entities,
  MaximizeType,
  ObjectiveType,
  ObjectiveUnit,
  rational,
  SimplexResultType,
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
    recipeIds: Mocks.AdjustedDataset.recipeIds,
    itemIds: Mocks.AdjustedDataset.itemIds,
    data: Mocks.AdjustedDataset,
    maximizeType: MaximizeType.Weight,
    surplusMachinesOutput: false,
    cost: {
      factor: rational(1n),
      machine: rational(1n),
      footprint: rational(1n),
      unproduceable: rational(1000000n),
      excluded: rational(0n),
      surplus: rational(0n),
      maximize: rational(-1000000n),
    },
  });
  const getResult = (
    resultType: SimplexResultType = SimplexResultType.Solved,
  ): MatrixSolution => ({
    resultType,
    time: 2,
    cost: rational(1n),
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
      expect(result['id'].out).toEqual(rational(0n));
      SimplexUtility.addItemValue(result, 'id', rational(1n));
      expect(result['id'].out).toEqual(rational(1n));
      SimplexUtility.addItemValue(result, 'id', rational(2n), 'lim');
      expect(result['id'].lim).toEqual(rational(2n));
    });
  });

  describe('solve', () => {
    it('should handle calculations paused', () => {
      expect(
        SimplexUtility.solve(
          [],
          {},
          {},
          [],
          MaximizeType.Weight,
          false,
          Mocks.Costs,
          Mocks.AdjustedDataset,
          true,
        ),
      ).toEqual({ steps: [], resultType: SimplexResultType.Paused });
    });

    it('should handle empty list of objectives', () => {
      expect(
        SimplexUtility.solve(
          [],
          {},
          {},
          [],
          MaximizeType.Weight,
          false,
          Mocks.Costs,
          Mocks.AdjustedDataset,
          false,
        ),
      ).toEqual({
        steps: [],
        resultType: SimplexResultType.Skipped,
      });
    });

    it('should update steps with solution from simplex method', () => {
      spyOn(SimplexUtility, 'getState').and.returnValue({
        steps: Mocks.Steps,
      } as any);
      const result = getResult(SimplexResultType.Solved);
      spyOn(SimplexUtility, 'getSolution').and.returnValue(result);
      spyOn(SimplexUtility, 'updateSteps');
      expect(
        SimplexUtility.solve(
          Mocks.Objectives,
          {},
          {},
          null,
          MaximizeType.Weight,
          false,
          Mocks.Costs,
          Mocks.AdjustedDataset,
          false,
        ),
      ).toEqual({
        steps: Mocks.Steps,
        resultType: SimplexResultType.Solved,
        returnCode: undefined,
        simplexStatus: undefined,
        unboundedRecipeId: undefined,
        time: 2,
        cost: rational(1n),
      });
      expect(SimplexUtility.updateSteps).toHaveBeenCalled();
    });

    it('should determine the unbounded ray result', () => {
      const result = SimplexUtility.solve(
        [
          {
            id: '0',
            targetId: RecipeId.AdvancedCircuit,
            value: rational(1n),
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Maximize,
            recipe:
              Mocks.AdjustedDataset.adjustedRecipe[RecipeId.AdvancedCircuit],
          },
        ],
        Mocks.ItemsStateInitial,
        Mocks.RecipesStateInitial,
        null,
        MaximizeType.Weight,
        false,
        Mocks.Costs,
        Mocks.AdjustedDataset,
        false,
      );
      expect(result.unboundedRecipeId).toBeDefined();
    });
  });

  describe('getState', () => {
    it('should build full state object', () => {
      spyOn(SimplexUtility, 'parseItemRecursively');
      const objectives = [
        ...Mocks.Objectives,
        Mocks.Objectives[3],
        Mocks.Objectives[7],
      ];
      const result = SimplexUtility.getState(
        objectives,
        Mocks.ItemsStateInitial,
        Mocks.RecipesState,
        Mocks.AdjustedDataset.technologyIds,
        MaximizeType.Weight,
        false,
        Mocks.Costs,
        Mocks.AdjustedDataset,
      );
      expect(result).toEqual({
        objectives,
        recipeObjectives: [Mocks.Objectives[4], Mocks.Objectives[6]] as any[],
        steps: [],
        recipes: {},
        itemValues: {
          [ItemId.AdvancedCircuit]: { out: rational(1n) },
          [ItemId.IronPlate]: { out: rational(0n), in: rational(1n) },
          [ItemId.PlasticBar]: { out: rational(0n), max: rational(1n) },
          [ItemId.PiercingRoundsMagazine]: { out: rational(0n) },
          [ItemId.FirearmMagazine]: { out: rational(0n) },
          [ItemId.SteelPlate]: { out: rational(0n) },
          [ItemId.CopperPlate]: {
            out: rational(0n),
            in: rational(141n, 40n),
          },
          [ItemId.PetroleumGas]: { out: rational(0n), lim: rational(100n) },
        },
        recipeLimits: { [RecipeId.IronPlate]: rational(10n) },
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
        recipeIds: Mocks.AdjustedDataset.recipeIds,
        itemIds: Mocks.AdjustedDataset.itemIds,
        data: Mocks.AdjustedDataset,
        maximizeType: MaximizeType.Weight,
        surplusMachinesOutput: false,
        cost: Mocks.Costs,
      });
    });
  });

  describe('recipeMatches', () => {
    it('should find matching recipes for an item', () => {
      const state = getState();
      const recipe = Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal];
      const result = SimplexUtility.recipeMatches(ItemId.Coal, state);
      expect(state.recipes).toEqual({ [RecipeId.Coal]: recipe });
      expect(result).toEqual([recipe]);
    });
  });

  describe('itemMatches', () => {
    it('should find matching items for a recipe', () => {
      const state = getState();
      const recipe = Mocks.AdjustedDataset.adjustedRecipe[RecipeId.CopperCable];
      const result = SimplexUtility.itemMatches(recipe, state);
      expect(state.itemValues[ItemId.CopperPlate].out).toEqual(rational(0n));
      expect(state.recipes).toEqual({});
      expect(result).toEqual([ItemId.CopperPlate]);
    });
  });

  describe('parseRecipeRecursively', () => {
    it('should do nothing for recipes with no inputs', () => {
      spyOn(SimplexUtility, 'parseItemRecursively');
      SimplexUtility.parseRecipeRecursively(
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.IronOre],
        getState(),
      );
      expect(SimplexUtility.parseItemRecursively).not.toHaveBeenCalled();
    });

    it('should parse recipe inputs recursively', () => {
      spyOn(SimplexUtility, 'itemMatches').and.returnValue([
        ItemId.CopperPlate,
      ]);
      spyOn(SimplexUtility, 'parseItemRecursively');
      const recipe = Mocks.AdjustedDataset.adjustedRecipe[RecipeId.CopperCable];
      const state = getState();
      SimplexUtility.parseRecipeRecursively(recipe, state);
      expect(SimplexUtility.itemMatches).toHaveBeenCalledWith(recipe, state);
      expect(SimplexUtility.parseItemRecursively).toHaveBeenCalledWith(
        ItemId.CopperPlate,
        state,
      );
    });
  });

  describe('parseItemRecursively', () => {
    it('should do nothing for simple recipe that was already parsed', () => {
      spyOn(SimplexUtility, 'parseRecipeRecursively');
      const state = getState();
      state.recipes[RecipeId.CopperCable] =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.CopperCable];
      SimplexUtility.parseItemRecursively(ItemId.CopperCable, state);
      expect(SimplexUtility.parseRecipeRecursively).not.toHaveBeenCalled();
    });

    it('should parse a simple recipe', () => {
      spyOn(SimplexUtility, 'parseRecipeRecursively');
      const state = getState();
      SimplexUtility.parseItemRecursively(ItemId.CopperCable, state);
      expect(SimplexUtility.parseRecipeRecursively).toHaveBeenCalledWith(
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.CopperCable],
        state,
      );
    });

    it('should get complex recipe matches and parse them', () => {
      const recipe =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.AdvancedOilProcessing];
      spyOn(SimplexUtility, 'recipeMatches').and.returnValue([recipe]);
      spyOn(SimplexUtility, 'parseRecipeRecursively');
      const state = getState();
      SimplexUtility.parseItemRecursively(ItemId.PetroleumGas, state);
      expect(SimplexUtility.recipeMatches).toHaveBeenCalledWith(
        ItemId.PetroleumGas,
        state,
      );
      expect(SimplexUtility.parseRecipeRecursively).toHaveBeenCalledWith(
        recipe,
        state,
      );
    });
  });

  describe('addSurplusVariables', () => {
    it('should add other items that only appear as recipe outputs', () => {
      const state = getState();
      state.recipes[RecipeId.Coal] =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal];
      SimplexUtility.addSurplusVariables(state);
      expect(state.itemValues[ItemId.Coal].out).toEqual(rational(0n));
    });
  });

  describe('parseUnproduceable', () => {
    it('should parse unproduceable items', () => {
      const state = getState();
      state.itemValues[ItemId.Wood] = { out: rational(1n) };
      state.itemValues[ItemId.Coal] = { out: rational(1n) };
      state.recipes = {
        [RecipeId.Coal]: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
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
      expect(result.resultType).toEqual(SimplexResultType.Solved);
    });

    it('should handle glpk failure', () => {
      spyOn(SimplexUtility, 'glpk').and.returnValue({ error: true } as any);
      const state = getState();
      const result = SimplexUtility.getSolution(state);
      expect(result.resultType).toEqual(SimplexResultType.Failed);
    });
  });

  describe('itemCost', () => {
    it('should adjust cost of fluids', () => {
      const state = getState();
      const result = SimplexUtility.itemCost(
        ItemId.PetroleumGas,
        'unproduceable',
        state,
      );
      expect(result).toEqual(
        state.cost.unproduceable.div(rational(10n)).toNumber(),
      );
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
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.CopperPlate];
      state.recipes[RecipeId.CopperPlate].cost = undefined;
      state.recipes[RecipeId.IronPlate] =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.IronPlate];
      state.itemValues[ItemId.Wood] = {
        out: rational(1n),
      };
      state.itemValues[ItemId.Coal] = { out: rational(1n) };
      state.itemValues[ItemId.IronPlate] = {
        out: rational(0n),
        max: rational(1n),
      };
      state.itemValues[ItemId.IronOre] = {
        out: rational(0n),
        in: rational(1n),
        lim: rational(10n),
      };
      state.itemValues[ItemId.CopperCable] = { out: rational(0n) };
      state.itemValues[ItemId.CopperPlate] = { out: rational(0n) };
      state.itemValues[ItemId.CopperOre] = { out: rational(0n) };
      state.recipeLimits[RecipeId.CopperPlate] = rational(10n);
      state.recipeObjectives = [
        {
          id: '0',
          targetId: RecipeId.IronPlate,
          value: rational(1n),
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.IronPlate],
        },
        {
          id: '1',
          targetId: RecipeId.CopperCable,
          value: rational(1n),
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Maximize,
          recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.CopperCable],
        },
      ];
      const result = SimplexUtility.glpk(state);
      expect(result.returnCode).toEqual('ok');
      expect(result.status).toEqual('optimal');
    });

    it('should find a solution using glpk maximizing by ratio', () => {
      const state = getState();
      state.maximizeType = MaximizeType.Ratio;
      state.surplusMachinesOutput = true;
      // Coal = excluded input, Wood = normal input
      state.itemIds = state.itemIds.filter((i) => i !== ItemId.Coal);
      state.unproduceableIds = [ItemId.Wood, ItemId.Coal, ItemId.IronOre];
      state.excludedIds = [ItemId.CopperOre];
      state.recipes[RecipeId.CopperPlate] =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.CopperPlate];
      state.recipes[RecipeId.IronPlate] =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.IronPlate];
      state.itemValues[ItemId.Wood] = {
        out: rational(1n),
      };
      state.itemValues[ItemId.Coal] = { out: rational(1n) };
      state.itemValues[ItemId.IronPlate] = {
        out: rational(0n),
        max: rational(1n),
      };
      state.itemValues[ItemId.IronOre] = {
        out: rational(0n),
        in: rational(1n),
        lim: rational(10n),
      };
      state.itemValues[ItemId.CopperCable] = { out: rational(0n) };
      state.itemValues[ItemId.CopperPlate] = { out: rational(0n) };
      state.itemValues[ItemId.CopperOre] = { out: rational(0n) };
      state.recipeLimits[RecipeId.CopperPlate] = rational(10n);
      state.recipeObjectives = [
        {
          id: '0',
          targetId: RecipeId.IronPlate,
          value: rational(1n),
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.IronPlate],
        },
        {
          id: '1',
          targetId: RecipeId.CopperCable,
          value: rational(1n),
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Maximize,
          recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.CopperCable],
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

  describe('updateSteps', () => {
    it('should walk through and update steps based on simplex result', () => {
      spyOn(SimplexUtility, 'addItemStep');
      spyOn(SimplexUtility, 'assignRecipes');
      spyOn(SimplexUtility, 'addRecipeStep');
      const state = getState();
      state.itemValues[ItemId.Coal] = { out: rational(0n) };
      state.itemValues[ItemId.IronOre] = { out: rational(0n) };
      state.recipes[RecipeId.Coal] =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal];
      state.recipes[ItemId.Wood] = { id: null } as any;
      state.recipes[RecipeId.IronOre] =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.IronOre];
      state.recipeObjectives = [Mocks.Objectives[4] as any];
      const solution: any = {
        surplus: { [ItemId.IronOre]: rational(1n) },
        inputs: { [ItemId.Wood]: rational(1n) },
        recipes: { [RecipeId.IronOre]: rational(2n) },
      };
      state.steps = [
        { id: '0' },
        { id: '1', output: rational(1n) },
        { id: '2' },
        { id: '3', output: rational(1n) },
      ];
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
        unproduceable: {},
        excluded: {},
        recipes: {
          [RecipeId.Coal]: rational(2n),
          [RecipeId.PlasticBar]: rational(1n),
        },
      };
      const state = getState();
      state.itemValues[ItemId.Coal] = { out: rational(3n) };
      state.recipes[RecipeId.Coal] =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal];
      state.recipes[RecipeId.PlasticBar] =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.PlasticBar];
      state.recipeObjectives = [Mocks.Objectives[4] as any];
      SimplexUtility.addItemStep(ItemId.Coal, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Coal,
          items: rational(1183n, 200n),
          output: rational(3n),
          parents: { '': rational(3n) },
        },
      ]);
    });

    it('should include recipe objective output a new step', () => {
      const solution: any = {
        surplus: {},
        unproduceable: { [ItemId.PiercingRoundsMagazine]: rational(1n) },
        excluded: { [ItemId.PiercingRoundsMagazine]: rational(1n) },
        recipes: {},
      };
      const state = getState();
      state.itemValues[ItemId.PiercingRoundsMagazine] = { out: rational(0n) };
      state.recipeObjectives = [Mocks.Objectives[4] as any];
      SimplexUtility.addItemStep(
        ItemId.PiercingRoundsMagazine,
        solution,
        state,
      );
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.PiercingRoundsMagazine,
          items: rational(59n, 12n),
        },
      ]);
    });

    it('should assign a surplus value', () => {
      const solution: any = {
        surplus: { [ItemId.Coal]: rational(3n) },
        unproduceable: {},
        excluded: {},
        recipes: { [RecipeId.Coal]: rational(4n) },
      };
      const state = getState();
      state.itemValues[ItemId.Coal] = { out: rational(0n) };
      state.recipes[RecipeId.Coal] =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal];
      SimplexUtility.addItemStep(ItemId.Coal, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Coal,
          items: rational(1183n, 100n),
          surplus: rational(3n),
        },
      ]);
    });

    it('should avoid floating point errors in surpluses', () => {
      const solution: any = {
        surplus: {
          [ItemId.Coal]: rational(1183000000001n, 100000000000n),
        },
        unproduceable: {},
        excluded: {},
        recipes: { [RecipeId.Coal]: rational(4n) },
      };
      const state = getState();
      state.itemValues[ItemId.Coal] = { out: rational(0n) };
      state.recipes[RecipeId.Coal] =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal];
      SimplexUtility.addItemStep(ItemId.Coal, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Coal,
          items: rational(1183n, 100n),
          surplus: rational(1183n, 100n),
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
      state.itemValues[ItemId.Coal] = { out: rational(0n), in: rational(1n) };
      SimplexUtility.addItemStep(ItemId.Coal, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Coal,
          items: rational(1n),
        },
      ]);
    });
  });

  describe('assignRecipes', () => {
    it('should assign recipes to appropriate steps', () => {
      const solution: any = {
        surplus: {},
        unproduceable: {},
        excluded: {},
        recipes: {
          [RecipeId.CopperCable]: rational(1n),
          [RecipeId.AdvancedOilProcessing]: rational(1n),
          [RecipeId.BasicOilProcessing]: rational(1n),
        },
      };
      const state = getState();
      state.steps = [
        {
          id: '0',
          itemId: ItemId.CopperCable,
          items: rational(0n),
        },
        {
          id: '1',
          itemId: ItemId.HeavyOil,
          items: rational(0n),
        },
        {
          id: '2',
          itemId: ItemId.PetroleumGas,
          items: rational(0n),
        },
        {
          id: '3',
          itemId: ItemId.LightOil,
          items: rational(0n),
        },
      ];
      state.recipes[RecipeId.CopperCable] =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.CopperCable];
      state.recipes[RecipeId.AdvancedOilProcessing] =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.AdvancedOilProcessing];
      state.recipes[RecipeId.BasicOilProcessing] =
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.BasicOilProcessing];
      state.recipeObjectives = [Mocks.Objectives[4] as any];
      SimplexUtility.assignRecipes(solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.CopperCable,
          recipeId: RecipeId.CopperCable,
          items: rational(0n),
        },
        {
          id: '1',
          itemId: ItemId.HeavyOil,
          recipeId: RecipeId.AdvancedOilProcessing,
          items: rational(0n),
        },
        {
          id: '2',
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.BasicOilProcessing,
          items: rational(0n),
        },
        {
          id: '3',
          itemId: ItemId.LightOil,
          items: rational(0n),
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
          items: rational(1n),
        },
      ];
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: rational(1n) },
      };
      SimplexUtility.addRecipeStep(
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
        solution,
        state,
      );
      expect(RateUtility.adjustPowerPollution).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: 'id',
          itemId: ItemId.Coal,
          recipeId: RecipeId.Coal,
          items: rational(1n),
          machines: rational(1n),
          recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
        },
      ]);
    });

    it('should add a new step', () => {
      spyOn(RateUtility, 'adjustPowerPollution');
      const state = getState();
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: rational(1n) },
      };
      SimplexUtility.addRecipeStep(
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
        solution,
        state,
      );
      expect(RateUtility.adjustPowerPollution).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: '0',
          recipeId: RecipeId.Coal,
          machines: rational(1n),
          recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
        },
      ]);
    });

    it('should add a recipe objective step', () => {
      spyOn(RateUtility, 'adjustPowerPollution');
      const state = getState();
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: rational(1n) },
      };
      SimplexUtility.addRecipeStep(
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
        solution,
        state,
        Mocks.Objectives[4] as any,
      );
      expect(RateUtility.adjustPowerPollution).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: '0',
          recipeId: RecipeId.Coal,
          machines: rational(1n),
          recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
          recipeObjectiveId: Mocks.Objectives[4].id,
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
          items: rational(0n),
        },
        {
          id: '1',
          itemId: ItemId.Wood,
          items: rational(0n),
        },
      ];
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.AdvancedOilProcessing]: rational(1n) },
      };
      SimplexUtility.addRecipeStep(
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.AdvancedOilProcessing],
        solution,
        state,
      );
      expect(RateUtility.adjustPowerPollution).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.BasicOilProcessing,
          items: rational(0n),
        },
        {
          id: '2',
          recipeId: RecipeId.AdvancedOilProcessing,
          machines: rational(1n),
          recipe:
            Mocks.AdjustedDataset.adjustedRecipe[
              RecipeId.AdvancedOilProcessing
            ],
        },
        { id: '1', itemId: ItemId.Wood, items: rational(0n) },
      ]);
    });
  });
});
