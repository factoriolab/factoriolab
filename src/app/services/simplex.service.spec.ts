import { TestBed } from '@angular/core/testing';

import { MaximizeType } from '~/models/enum/maximize-type';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { SimplexResultType } from '~/models/enum/simplex-result-type';
import { rational } from '~/models/rational';
import { Entities } from '~/models/utils';
import { ItemId, Mocks, RecipeId, TestModule } from '~/tests';

import {
  ItemValues,
  MatrixSolution,
  MatrixState,
  SimplexService,
} from './simplex.service';

describe('SimplexService', () => {
  let service: SimplexService;
  const getState = (): MatrixState => ({
    objectives: [],
    recipeObjectives: [],
    steps: [],
    recipes: {},
    itemValues: {},
    recipeLimits: {},
    unproduceableIds: new Set(),
    excludedIds: new Set(),
    itemIds: Mocks.adjustedDataset.itemIds,
    data: Mocks.adjustedDataset,
    maximizeType: MaximizeType.Weight,
    requireMachinesOutput: true,
    costs: {
      factor: rational.one,
      machine: rational.one,
      recycling: rational(1000n),
      footprint: rational.one,
      unproduceable: rational(1000000n),
      excluded: rational.zero,
      surplus: rational.zero,
      maximize: rational(-1000000n),
    },
    hasSurplusCost: false,
  });
  const getResult = (
    resultType: SimplexResultType = SimplexResultType.Solved,
  ): MatrixSolution => ({
    resultType,
    time: 2,
    cost: rational.one,
    itemIds: [],
    recipeIds: [],
    unproduceableIds: new Set(),
    excludedIds: new Set(),
    surplus: {},
    unproduceable: {},
    excluded: {},
    recipes: {},
  });

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(SimplexService);
  });

  describe('addItemValue', () => {
    it('should add a value to an entity of Rationals', () => {
      const result: Entities<ItemValues> = {};
      service.addItemValue(result, 'id');
      expect(result['id'].out).toEqual(rational.zero);
      service.addItemValue(result, 'id', rational.one);
      expect(result['id'].out).toEqual(rational.one);
      service.addItemValue(result, 'id', rational(2n), 'lim');
      expect(result['id'].lim).toEqual(rational(2n));
    });
  });

  describe('solve', () => {
    it('should handle calculations paused', () => {
      expect(
        service.solve(
          [],
          Mocks.settingsStateInitial,
          Mocks.adjustedDataset,
          true,
        ),
      ).toEqual({ steps: [], resultType: SimplexResultType.Paused });
    });

    it('should handle empty list of objectives', () => {
      expect(
        service.solve(
          [],
          Mocks.settingsStateInitial,
          Mocks.adjustedDataset,
          false,
        ),
      ).toEqual({
        steps: [],
        resultType: SimplexResultType.Skipped,
      });
    });

    it('should update steps with solution from simplex method', () => {
      spyOn(service, 'getState').and.returnValue({
        steps: Mocks.steps,
      } as any);
      const result = getResult(SimplexResultType.Solved);
      spyOn(service, 'getSolution').and.returnValue(result);
      spyOn(service, 'updateSteps');
      expect(
        service.solve(
          Mocks.objectives,
          Mocks.settingsStateInitial,
          Mocks.adjustedDataset,
          false,
        ),
      ).toEqual({
        steps: Mocks.steps,
        resultType: SimplexResultType.Solved,
        returnCode: undefined,
        simplexStatus: undefined,
        unboundedRecipeId: undefined,
        time: 2,
        cost: rational.one,
      });
      expect(service.updateSteps).toHaveBeenCalled();
    });

    it('should determine the unbounded ray result', () => {
      const result = service.solve(
        [
          {
            id: '0',
            targetId: RecipeId.AdvancedCircuit,
            value: rational.one,
            unit: ObjectiveUnit.Items,
            type: ObjectiveType.Maximize,
          },
        ],
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
        false,
      );
      expect(result.unboundedRecipeId).toBeDefined();
    });
  });

  describe('getState', () => {
    it('should build full state object', () => {
      spyOn(service, 'parseItemRecursively');
      const objectives = [
        ...Mocks.objectives,
        Mocks.objectives[3],
        Mocks.objectives[7],
      ];
      const result = service.getState(
        objectives,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(result).toEqual({
        objectives,
        recipeObjectives: [Mocks.objectives[4], Mocks.objectives[6]] as any[],
        steps: [],
        recipes: {},
        itemValues: {
          [ItemId.AdvancedCircuit]: { out: rational.one },
          [ItemId.IronPlate]: { out: rational.zero, in: rational.one },
          [ItemId.PlasticBar]: { out: rational.zero, max: rational.one },
          [ItemId.PiercingRoundsMagazine]: { out: rational.zero },
          [ItemId.FirearmMagazine]: { out: rational.zero },
          [ItemId.SteelPlate]: { out: rational.zero },
          [ItemId.CopperPlate]: {
            out: rational.zero,
            in: rational(141n, 40n),
          },
          [ItemId.PetroleumGas]: { out: rational.zero, lim: rational(100n) },
        },
        recipeLimits: { [RecipeId.IronPlate]: rational(10n) },
        unproduceableIds: new Set([
          ItemId.AdvancedCircuit,
          ItemId.IronPlate,
          ItemId.PlasticBar,
          ItemId.PetroleumGas,
          ItemId.PiercingRoundsMagazine,
          ItemId.FirearmMagazine,
          ItemId.SteelPlate,
          ItemId.CopperPlate,
        ]),
        excludedIds: new Set(),
        itemIds: Mocks.adjustedDataset.itemIds,
        data: Mocks.adjustedDataset,
        maximizeType: MaximizeType.Ratio,
        requireMachinesOutput: false,
        costs: Mocks.costs,
        hasSurplusCost: false,
      });
    });
  });

  describe('recipeMatches', () => {
    it('should find matching recipes for an item', () => {
      const state = getState();
      const recipe = Mocks.adjustedDataset.adjustedRecipe[RecipeId.CopperOre];
      const result = service.recipeMatches(ItemId.CopperOre, state);
      expect(state.recipes).toEqual({
        [RecipeId.CopperOre]: recipe,
      });
      expect(result).toEqual([recipe]);
    });

    it('should include all input/output recipes if surplus cost > 0', () => {
      const state = getState();
      state.hasSurplusCost = true;
      const recipe = Mocks.adjustedDataset.adjustedRecipe[RecipeId.CopperOre];
      const recipe2 =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.CopperPlate];
      const result = service.recipeMatches(ItemId.CopperOre, state);
      expect(state.recipes).toEqual({
        [RecipeId.CopperOre]: recipe,
        [RecipeId.CopperPlate]: recipe2,
      });
      expect(result).toEqual([recipe2, recipe]);
    });
  });

  describe('itemMatches', () => {
    it('should find matching items for a recipe', () => {
      const state = getState();
      const recipe = Mocks.adjustedDataset.adjustedRecipe[RecipeId.CopperCable];
      const result = service.itemMatches(recipe, state);
      expect(state.itemValues[ItemId.CopperPlate].out).toEqual(rational.zero);
      expect(state.recipes).toEqual({});
      expect(result).toEqual([ItemId.CopperPlate]);
    });

    it('should include recipe output items if surplus cost > 0', () => {
      const state = getState();
      state.hasSurplusCost = true;
      const recipe = Mocks.adjustedDataset.adjustedRecipe[RecipeId.CopperCable];
      const result = service.itemMatches(recipe, state);
      expect(state.itemValues[ItemId.CopperPlate].out).toEqual(rational.zero);
      expect(state.recipes).toEqual({});
      expect(result).toEqual([ItemId.CopperPlate, ItemId.CopperCable]);
    });
  });

  describe('parseRecipeRecursively', () => {
    it('should parse recipe inputs recursively', () => {
      spyOn(service, 'itemMatches').and.returnValue([ItemId.CopperPlate]);
      spyOn(service, 'parseItemRecursively');
      const recipe = Mocks.adjustedDataset.adjustedRecipe[RecipeId.CopperCable];
      const state = getState();
      service.parseRecipeRecursively(recipe, state);
      expect(service.itemMatches).toHaveBeenCalledWith(recipe, state);
      expect(service.parseItemRecursively).toHaveBeenCalledWith(
        ItemId.CopperPlate,
        state,
      );
    });
  });

  describe('parseItemRecursively', () => {
    it('should parse a simple recipe', () => {
      spyOn(service, 'parseRecipeRecursively');
      const state = getState();
      service.parseItemRecursively(ItemId.CopperCable, state);
      expect(service.parseRecipeRecursively).toHaveBeenCalledWith(
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.CopperCable],
        state,
      );
    });

    it('should get complex recipe matches and parse them', () => {
      const recipe =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.AdvancedOilProcessing];
      spyOn(service, 'recipeMatches').and.returnValue([recipe]);
      spyOn(service, 'parseRecipeRecursively');
      const state = getState();
      service.parseItemRecursively(ItemId.PetroleumGas, state);
      expect(service.recipeMatches).toHaveBeenCalledWith(
        ItemId.PetroleumGas,
        state,
      );
      expect(service.parseRecipeRecursively).toHaveBeenCalledWith(
        recipe,
        state,
      );
    });
  });

  describe('addSurplusVariables', () => {
    it('should add other items that only appear as recipe outputs', () => {
      const state = getState();
      state.recipes[RecipeId.Coal] =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal];
      service.addSurplusVariables(state);
      expect(state.itemValues[ItemId.Coal].out).toEqual(rational.zero);
    });
  });

  describe('parseUnproduceable', () => {
    it('should parse unproduceable items', () => {
      const state = getState();
      state.itemValues[ItemId.Wood] = { out: rational.one };
      state.itemValues[ItemId.Coal] = { out: rational.one };
      state.recipes = {
        [RecipeId.Coal]: Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal],
      };
      service.parseUnproduceable(state);
      expect(state.unproduceableIds).toEqual(new Set([ItemId.Wood]));
    });
  });

  describe('getSolution', () => {
    it('should parse the solution found by simplex', () => {
      spyOn(service, 'glpk').and.returnValue({} as any);
      const state = getState();
      const result = service.getSolution(state);
      expect(result.resultType).toEqual(SimplexResultType.Solved);
    });

    it('should handle glpk failure', () => {
      spyOn(service, 'glpk').and.returnValue({ error: true } as any);
      const state = getState();
      const result = service.getSolution(state);
      expect(result.resultType).toEqual(SimplexResultType.Failed);
    });
  });

  describe('itemCost', () => {
    it('should adjust cost of fluids', () => {
      const state = getState();
      const result = service.itemCost(
        ItemId.PetroleumGas,
        'unproduceable',
        state,
      );
      expect(result).toEqual(
        state.costs.unproduceable.div(rational(10n)).toNumber(),
      );
    });
  });

  describe('glpk', () => {
    it('should find a solution using glpk', () => {
      const state = getState();
      // Coal = excluded input, Wood = normal input
      state.itemIds = state.itemIds.filter((i) => i !== ItemId.Coal);
      state.unproduceableIds = new Set([
        ItemId.Wood,
        ItemId.Coal,
        ItemId.IronOre,
      ]);
      state.excludedIds = new Set([ItemId.CopperOre]);
      state.recipes[RecipeId.CopperPlate] =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.CopperPlate];
      state.recipes[RecipeId.CopperPlate].cost = undefined;
      state.recipes[RecipeId.IronPlate] =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.IronPlate];
      state.itemValues[ItemId.Wood] = {
        out: rational.one,
      };
      state.itemValues[ItemId.Coal] = { out: rational.one };
      state.itemValues[ItemId.IronPlate] = {
        out: rational.zero,
        max: rational.one,
      };
      state.itemValues[ItemId.IronOre] = {
        out: rational.zero,
        in: rational.one,
        lim: rational(10n),
      };
      state.itemValues[ItemId.CopperCable] = { out: rational.zero };
      state.itemValues[ItemId.CopperPlate] = { out: rational.zero };
      state.itemValues[ItemId.CopperOre] = { out: rational.zero };
      state.recipeLimits[RecipeId.CopperPlate] = rational(10n);
      state.recipeObjectives = [
        {
          id: '0',
          targetId: RecipeId.IronPlate,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.IronPlate],
        },
        {
          id: '1',
          targetId: RecipeId.CopperCable,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Maximize,
          recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.CopperCable],
        },
      ];
      const result = service.glpk(state);
      expect(result.returnCode).toEqual('ok');
      expect(result.status).toEqual('optimal');
    });

    it('should find a solution using glpk maximizing by ratio', () => {
      const state = getState();
      state.maximizeType = MaximizeType.Ratio;
      state.requireMachinesOutput = false;
      // Coal = excluded input, Wood = normal input
      state.itemIds = state.itemIds.filter((i) => i !== ItemId.Coal);
      state.unproduceableIds = new Set([
        ItemId.Wood,
        ItemId.Coal,
        ItemId.IronOre,
      ]);
      state.excludedIds = new Set([ItemId.CopperOre]);
      state.recipes[RecipeId.CopperPlate] =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.CopperPlate];
      state.recipes[RecipeId.IronPlate] =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.IronPlate];
      state.itemValues[ItemId.Wood] = {
        out: rational.one,
      };
      state.itemValues[ItemId.Coal] = { out: rational.one };
      state.itemValues[ItemId.IronPlate] = {
        out: rational.zero,
        max: rational.one,
      };
      state.itemValues[ItemId.IronOre] = {
        out: rational.zero,
        in: rational.one,
        lim: rational(10n),
      };
      state.itemValues[ItemId.CopperCable] = { out: rational.zero };
      state.itemValues[ItemId.CopperPlate] = { out: rational.zero };
      state.itemValues[ItemId.CopperOre] = { out: rational.zero };
      state.recipeLimits[RecipeId.CopperPlate] = rational(10n);
      state.recipeObjectives = [
        {
          id: '0',
          targetId: RecipeId.IronPlate,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.IronPlate],
        },
        {
          id: '1',
          targetId: RecipeId.CopperCable,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Maximize,
          recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.CopperCable],
        },
      ];
      const result = service.glpk(state);
      expect(result.returnCode).toEqual('ok');
      expect(result.status).toEqual('optimal');
    });

    it('should handle glpk failure', () => {
      spyOn(service, 'glpkSimplex').and.returnValue(['failure', 'infeasible']);
      const state = getState();
      const result = service.glpk(state);
      expect(result.returnCode).toEqual('failure');
    });
  });

  describe('updateSteps', () => {
    it('should walk through and update steps based on simplex result', () => {
      spyOn(service, 'addItemStep');
      spyOn(service, 'assignRecipes');
      spyOn(service, 'addRecipeStep');
      const state = getState();
      state.itemValues[ItemId.Coal] = { out: rational.zero };
      state.itemValues[ItemId.IronOre] = { out: rational.zero };
      state.recipes[RecipeId.Coal] =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal];
      state.recipes[ItemId.Wood] = { id: null } as any;
      state.recipes[RecipeId.IronOre] =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.IronOre];
      state.recipeObjectives = [Mocks.objectives[4] as any];
      const solution: any = {
        surplus: { [ItemId.IronOre]: rational.one },
        inputs: { [ItemId.Wood]: rational.one },
        recipes: { [RecipeId.IronOre]: rational(2n) },
      };
      state.steps = [
        { id: '0' },
        { id: '1', output: rational.one },
        { id: '2' },
        { id: '3', output: rational.one },
      ];
      service.updateSteps(solution, state);
      expect(service.addItemStep).toHaveBeenCalledTimes(2);
      expect(service.assignRecipes).toHaveBeenCalledTimes(1);
      expect(service.addRecipeStep).toHaveBeenCalledTimes(2);
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
          [RecipeId.PlasticBar]: rational.one,
        },
      };
      const state = getState();
      state.itemValues[ItemId.Coal] = { out: rational(3n) };
      state.recipes[RecipeId.Coal] =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal];
      state.recipes[RecipeId.PlasticBar] =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.PlasticBar];
      state.recipeObjectives = [Mocks.objectives[4] as any];
      service.addItemStep(ItemId.Coal, solution, state);
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
        unproduceable: { [ItemId.PiercingRoundsMagazine]: rational.one },
        excluded: { [ItemId.PiercingRoundsMagazine]: rational.one },
        recipes: {},
      };
      const state = getState();
      state.itemValues[ItemId.PiercingRoundsMagazine] = { out: rational.zero };
      state.recipeObjectives = [Mocks.objectives[4] as any];
      service.addItemStep(ItemId.PiercingRoundsMagazine, solution, state);
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
      state.itemValues[ItemId.Coal] = { out: rational.zero };
      state.recipes[RecipeId.Coal] =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal];
      service.addItemStep(ItemId.Coal, solution, state);
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
      state.itemValues[ItemId.Coal] = { out: rational.zero };
      state.recipes[RecipeId.Coal] =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal];
      service.addItemStep(ItemId.Coal, solution, state);
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
      state.itemValues[ItemId.Coal] = { out: rational.zero, in: rational.one };
      service.addItemStep(ItemId.Coal, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Coal,
          items: rational.one,
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
          [RecipeId.CopperCable]: rational.one,
          [RecipeId.AdvancedOilProcessing]: rational.one,
          [RecipeId.BasicOilProcessing]: rational.one,
        },
      };
      const state = getState();
      state.steps = [
        {
          id: '0',
          itemId: ItemId.CopperCable,
          items: rational.zero,
        },
        {
          id: '1',
          itemId: ItemId.HeavyOil,
          items: rational.zero,
        },
        {
          id: '2',
          itemId: ItemId.PetroleumGas,
          items: rational.zero,
        },
        {
          id: '3',
          itemId: ItemId.LightOil,
          items: rational.zero,
        },
      ];
      state.recipes[RecipeId.CopperCable] =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.CopperCable];
      state.recipes[RecipeId.AdvancedOilProcessing] =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.AdvancedOilProcessing];
      state.recipes[RecipeId.BasicOilProcessing] =
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.BasicOilProcessing];
      state.recipeObjectives = [Mocks.objectives[4] as any];
      service.assignRecipes(solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.CopperCable,
          recipeId: RecipeId.CopperCable,
          items: rational.zero,
        },
        {
          id: '1',
          itemId: ItemId.HeavyOil,
          recipeId: RecipeId.AdvancedOilProcessing,
          items: rational.zero,
        },
        {
          id: '2',
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.BasicOilProcessing,
          items: rational.zero,
        },
        {
          id: '3',
          itemId: ItemId.LightOil,
          items: rational.zero,
        },
      ]);
    });
  });

  describe('addRecipeStep', () => {
    it('should update an existing step', () => {
      spyOn(service.rateSvc, 'adjustPowerPollution');
      const state = getState();
      state.steps = [
        {
          id: 'id',
          itemId: ItemId.Coal,
          items: rational.one,
        },
      ];
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: rational.one },
      };
      service.addRecipeStep(
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal],
        solution,
        state,
      );
      expect(service.rateSvc.adjustPowerPollution).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: 'id',
          itemId: ItemId.Coal,
          recipeId: RecipeId.Coal,
          items: rational.one,
          machines: rational.one,
          recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal],
        },
      ]);
    });

    it('should add a new step', () => {
      spyOn(service.rateSvc, 'adjustPowerPollution');
      const state = getState();
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: rational.one },
      };
      service.addRecipeStep(
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal],
        solution,
        state,
      );
      expect(service.rateSvc.adjustPowerPollution).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: '0',
          recipeId: RecipeId.Coal,
          machines: rational.one,
          recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal],
        },
      ]);
    });

    it('should add a recipe objective step', () => {
      spyOn(service.rateSvc, 'adjustPowerPollution');
      const state = getState();
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: rational.one },
      };
      service.addRecipeStep(
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal],
        solution,
        state,
        Mocks.objectives[4] as any,
      );
      expect(service.rateSvc.adjustPowerPollution).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: '0',
          recipeId: RecipeId.Coal,
          machines: rational.one,
          recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal],
          recipeObjectiveId: Mocks.objectives[4].id,
        },
      ]);
    });

    it('should place a new step next to related steps', () => {
      spyOn(service.rateSvc, 'adjustPowerPollution');
      const state = getState();
      state.steps = [
        {
          id: '0',
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.BasicOilProcessing,
          items: rational.zero,
        },
        {
          id: '1',
          itemId: ItemId.Wood,
          items: rational.zero,
        },
      ];
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.AdvancedOilProcessing]: rational.one },
      };
      service.addRecipeStep(
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.AdvancedOilProcessing],
        solution,
        state,
      );
      expect(service.rateSvc.adjustPowerPollution).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.BasicOilProcessing,
          items: rational.zero,
        },
        {
          id: '2',
          recipeId: RecipeId.AdvancedOilProcessing,
          machines: rational.one,
          recipe:
            Mocks.adjustedDataset.adjustedRecipe[
              RecipeId.AdvancedOilProcessing
            ],
        },
        { id: '1', itemId: ItemId.Wood, items: rational.zero },
      ]);
    });
  });
});
