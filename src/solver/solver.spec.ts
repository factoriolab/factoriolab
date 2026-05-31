import { TestBed } from '@angular/core/testing';
import { loadModule } from 'glpk-ts';

import { rational } from '~/rational/rational';
import { ObjectiveType } from '~/state/objectives/objective-type';
import { ObjectiveUnit } from '~/state/objectives/objective-unit';
import { RecipesStore } from '~/state/recipes/recipes-store';
import { MaximizeType } from '~/state/settings/maximize-type';
import { initialSettingsState } from '~/state/settings/settings-state';
import { SettingsStore } from '~/state/settings/settings-store';
import { ItemId } from '~/tests/item-id';
import { Mocks } from '~/tests/mocks/mocks';
import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';
import { spread } from '~/utils/object';

import { ItemValues } from './item-values';
import { SimplexResultType } from './simplex-result-type';
import { SimplexSolution } from './simplex-solution';
import { SimplexState } from './simplex-state';
import { Solver } from './solver';

describe('Solver', () => {
  let service: Solver;
  let settingsStore: SettingsStore;
  let recipesStore: RecipesStore;
  let mocks: Mocks;
  let getState: () => SimplexState;

  const getResult = (
    resultType: SimplexResultType = 'solved',
  ): SimplexSolution => ({
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

  beforeEach(async () => {
    await loadModule('/assets/glpk-wasm/glpk.all.wasm');
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(Solver);
    settingsStore = TestBed.inject(SettingsStore);
    recipesStore = TestBed.inject(RecipesStore);
    mocks = TestBed.inject(Mocks);

    getState = (): SimplexState => ({
      objectives: [],
      recipeObjectives: [],
      steps: [],
      recipes: {},
      itemValues: {},
      recipeLimits: {},
      unproduceableIds: new Set(),
      excludedIds: new Set(),
      itemIds: recipesStore.adjustedDataset().itemIds,
      data: recipesStore.adjustedDataset(),
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
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('solve', () => {
    it('should handle calculations paused', () => {
      expect(
        service.solve(
          [],
          settingsStore.settings(),
          recipesStore.adjustedDataset(),
          true,
        ),
      ).toEqual({ steps: [], resultType: 'paused' });
    });

    it('should handle empty list of objectives', () => {
      expect(
        service.solve(
          [],
          settingsStore.settings(),
          recipesStore.adjustedDataset(),
          false,
        ),
      ).toEqual({ steps: [], resultType: 'skipped' });
    });

    it('should update steps with solution from simplex method', () => {
      spyOn<any>(service, 'getState').and.returnValue({
        steps: mocks.steps(),
      } as any);
      const result = getResult();
      spyOn<any>(service, 'getSolution').and.returnValue(result);
      spyOn<any>(service, 'updateSteps');
      expect(
        service.solve(
          mocks.objectives(),
          settingsStore.settings(),
          recipesStore.adjustedDataset(),
          false,
        ),
      ).toEqual({
        steps: mocks.steps(),
        resultType: 'solved',
        returnCode: undefined,
        simplexStatus: undefined,
        unboundedRecipeId: undefined,
        time: 2,
        cost: rational.one,
      });
      expect(service['updateSteps']).toHaveBeenCalled();
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
        settingsStore.settings(),
        recipesStore.adjustedDataset(),
        false,
      );
      expect(result.unboundedRecipeId).toBeDefined();
    });
  });

  describe('addItemValue', () => {
    it('should add a value to an entity of Rationals', () => {
      const result: Record<string, ItemValues> = {};
      service['addItemValue'](result, 'id');
      expect(result['id'].out).toEqual(rational.zero);
      service['addItemValue'](result, 'id', rational.one);
      expect(result['id'].out).toEqual(rational.one);
      service['addItemValue'](result, 'id', rational(2n), 'lim');
      expect(result['id'].lim).toEqual(rational(2n));
    });
  });

  describe('getState', () => {
    it('should build full state object', () => {
      spyOn<any>(service, 'parseItemRecursively');
      const mockObjectives = mocks.objectives();
      const data = recipesStore.adjustedDataset();
      const objectives = [
        ...mockObjectives,
        mockObjectives[3],
        mockObjectives[7],
      ];
      const result = service['getState'](
        objectives,
        settingsStore.settings(),
        data,
      );
      expect(result).toEqual({
        objectives,
        recipeObjectives: [mockObjectives[4], mockObjectives[6]] as any[],
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
            in: rational(423n, 200n),
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
        itemIds: data.itemIds,
        data,
        maximizeType: MaximizeType.Ratio,
        requireMachinesOutput: false,
        costs: initialSettingsState.costs,
        hasSurplusCost: false,
      });
    });
  });

  describe('recipeMatches', () => {
    it('should find matching recipes for an item', () => {
      const state = getState();
      const recipe =
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.CopperOre];
      const result = service['recipeMatches'](ItemId.CopperOre, state);
      expect(state.recipes).toEqual({
        [RecipeId.CopperOre]: recipe,
      });
      expect(result).toEqual([recipe]);
    });

    it('should include all input/output recipes if surplus cost > 0', () => {
      const state = getState();
      state.hasSurplusCost = true;
      const recipe =
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.CopperOre];
      const recipe2 =
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.CopperPlate];
      const result = service['recipeMatches'](ItemId.CopperOre, state);
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
      const recipe =
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.CopperCable];
      const result = service['itemMatches'](recipe, state);
      expect(state.itemValues[ItemId.CopperPlate].out).toEqual(rational.zero);
      expect(state.recipes).toEqual({});
      expect(result).toEqual([ItemId.CopperPlate]);
    });

    it('should include recipe output items if surplus cost > 0', () => {
      const state = getState();
      state.hasSurplusCost = true;
      const recipe =
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.CopperCable];
      const result = service['itemMatches'](recipe, state);
      expect(state.itemValues[ItemId.CopperPlate].out).toEqual(rational.zero);
      expect(state.recipes).toEqual({});
      expect(result).toEqual([ItemId.CopperPlate, ItemId.CopperCable]);
    });
  });

  describe('parseRecipeRecursively', () => {
    it('should parse recipe inputs recursively', () => {
      spyOn<any>(service, 'itemMatches').and.returnValue([ItemId.CopperPlate]);
      spyOn<any>(service, 'parseItemRecursively');
      const recipe =
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.CopperCable];
      const state = getState();
      service['parseRecipeRecursively'](recipe, state);
      expect(service['itemMatches']).toHaveBeenCalledWith(recipe, state);
      expect(service['parseItemRecursively']).toHaveBeenCalledWith(
        ItemId.CopperPlate,
        state,
      );
    });
  });

  describe('parseItemRecursively', () => {
    it('should parse a simple recipe', () => {
      spyOn<any>(service, 'parseRecipeRecursively');
      const state = getState();
      service['parseItemRecursively'](ItemId.CopperCable, state);
      expect(service['parseRecipeRecursively']).toHaveBeenCalledWith(
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.CopperCable],
        state,
      );
    });

    it('should get complex recipe matches and parse them', () => {
      const recipe =
        recipesStore.adjustedDataset().adjustedRecipe[
          RecipeId.AdvancedOilProcessing
        ];
      spyOn<any>(service, 'recipeMatches').and.returnValue([recipe]);
      spyOn<any>(service, 'parseRecipeRecursively');
      const state = getState();
      service['parseItemRecursively'](ItemId.PetroleumGas, state);
      expect(service['recipeMatches']).toHaveBeenCalledWith(
        ItemId.PetroleumGas,
        state,
      );
      expect(service['parseRecipeRecursively']).toHaveBeenCalledWith(
        recipe,
        state,
      );
    });
  });

  describe('addSurplusVariables', () => {
    it('should add other items that only appear as recipe outputs', () => {
      const state = getState();
      state.recipes[RecipeId.Coal] =
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.Coal];
      service['addSurplusVariables'](state);
      expect(state.itemValues[ItemId.Coal].out).toEqual(rational.zero);
    });
  });

  describe('parseUnproduceable', () => {
    it('should parse unproduceable items', () => {
      const state = getState();
      state.itemValues[ItemId.Wood] = { out: rational.one };
      state.itemValues[ItemId.Coal] = { out: rational.one };
      state.recipes = {
        [RecipeId.Coal]:
          recipesStore.adjustedDataset().adjustedRecipe[RecipeId.Coal],
      };
      service['parseUnproduceable'](state);
      expect(state.unproduceableIds).toEqual(new Set([ItemId.Wood]));
    });
  });

  describe('getSolution', () => {
    it('should parse the solution found by simplex', () => {
      spyOn<any>(service, 'glpk').and.returnValue({});
      const state = getState();
      const result = service['getSolution'](state);
      expect(result.resultType).toEqual('solved');
    });

    it('should handle glpk failure', () => {
      spyOn<any>(service, 'glpk').and.returnValue({ error: true });
      const state = getState();
      const result = service['getSolution'](state);
      expect(result.resultType).toEqual('failed');
    });
  });

  describe('itemCost', () => {
    it('should adjust cost of fluids', () => {
      const state = getState();
      const result = service['itemCost'](
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
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.CopperPlate];
      state.recipes[RecipeId.CopperPlate].cost = undefined;
      state.recipes[RecipeId.IronPlate] =
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.IronPlate];
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
          recipe:
            recipesStore.adjustedDataset().adjustedRecipe[RecipeId.IronPlate],
        },
        {
          id: '1',
          targetId: RecipeId.CopperCable,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Maximize,
          recipe:
            recipesStore.adjustedDataset().adjustedRecipe[RecipeId.CopperCable],
        },
      ];
      const result = service['glpk'](state);
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
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.CopperPlate];
      state.recipes[RecipeId.IronPlate] =
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.IronPlate];
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
          recipe:
            recipesStore.adjustedDataset().adjustedRecipe[RecipeId.IronPlate],
        },
        {
          id: '1',
          targetId: RecipeId.CopperCable,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Maximize,
          recipe:
            recipesStore.adjustedDataset().adjustedRecipe[RecipeId.CopperCable],
        },
      ];
      const result = service['glpk'](state);
      expect(result.returnCode).toEqual('ok');
      expect(result.status).toEqual('optimal');
    });

    it('should handle glpk failure', () => {
      spyOn<any>(service, 'glpkSimplex').and.returnValue([
        'failure',
        'infeasible',
      ]);
      const state = getState();
      const result = service['glpk'](state);
      expect(result.returnCode).toEqual('failure');
    });
  });

  describe('updateSteps', () => {
    it('should walk through and update steps based on simplex result', () => {
      spyOn<any>(service, 'addItemStep');
      spyOn<any>(service, 'assignRecipes');
      spyOn<any>(service, 'addRecipeStep');
      const state = getState();
      state.itemValues[ItemId.Coal] = { out: rational.zero };
      state.itemValues[ItemId.IronOre] = { out: rational.zero };
      state.recipes[RecipeId.Coal] =
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.Coal];
      state.recipes[ItemId.Wood] = { id: null } as any;
      state.recipes[RecipeId.IronOre] =
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.IronOre];
      state.recipeObjectives = [mocks.objectives()[4] as any];
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
      service['updateSteps'](solution, state);
      expect(service['addItemStep']).toHaveBeenCalledTimes(2);
      expect(service['assignRecipes']).toHaveBeenCalledTimes(1);
      expect(service['addRecipeStep']).toHaveBeenCalledTimes(2);
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
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.Coal];
      state.recipes[RecipeId.PlasticBar] =
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.PlasticBar];
      state.recipeObjectives = [mocks.objectives()[4] as any];
      service['addItemStep'](ItemId.Coal, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Coal,
          items: rational(4539n, 1000n),
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
      state.recipeObjectives = [mocks.objectives()[4] as any];
      service['addItemStep'](ItemId.PiercingRoundsMagazine, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.PiercingRoundsMagazine,
          items: rational(33n, 10n),
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
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.Coal];
      service['addItemStep'](ItemId.Coal, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Coal,
          items: rational(4539n, 500n),
          surplus: rational(3n),
        },
      ]);
    });

    it('should avoid floating point errors in surpluses', () => {
      const solution: any = {
        surplus: {
          [ItemId.Coal]: rational(4539000000001n, 500000000000n),
        },
        unproduceable: {},
        excluded: {},
        recipes: { [RecipeId.Coal]: rational(4n) },
      };
      const state = getState();
      state.itemValues[ItemId.Coal] = { out: rational.zero };
      state.recipes[RecipeId.Coal] =
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.Coal];
      service['addItemStep'](ItemId.Coal, solution, state);
      expect(state.steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Coal,
          items: rational(4539n, 500n),
          surplus: rational(4539n, 500n),
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
      service['addItemStep'](ItemId.Coal, solution, state);
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
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.CopperCable];
      state.recipes[RecipeId.AdvancedOilProcessing] =
        recipesStore.adjustedDataset().adjustedRecipe[
          RecipeId.AdvancedOilProcessing
        ];
      state.recipes[RecipeId.BasicOilProcessing] =
        recipesStore.adjustedDataset().adjustedRecipe[
          RecipeId.BasicOilProcessing
        ];
      state.recipeObjectives = [mocks.objectives()[4] as any];
      service['assignRecipes'](solution, state);
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
      spyOn<any>(service, 'adjustPowerPollution');
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
      service['addRecipeStep'](
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.Coal],
        solution,
        state,
      );
      expect(service['adjustPowerPollution']).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: 'id',
          itemId: ItemId.Coal,
          recipeId: RecipeId.Coal,
          items: rational.one,
          machines: rational.one,
          recipe: recipesStore.adjustedDataset().adjustedRecipe[RecipeId.Coal],
        },
      ]);
    });

    it('should add a new step', () => {
      spyOn<any>(service, 'adjustPowerPollution');
      const state = getState();
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: rational.one },
      };
      service['addRecipeStep'](
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.Coal],
        solution,
        state,
      );
      expect(service['adjustPowerPollution']).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: '0',
          recipeId: RecipeId.Coal,
          machines: rational.one,
          recipe: recipesStore.adjustedDataset().adjustedRecipe[RecipeId.Coal],
        },
      ]);
    });

    it('should add a recipe objective step', () => {
      spyOn<any>(service, 'adjustPowerPollution');
      const state = getState();
      const solution: any = {
        surplus: {},
        inputs: {},
        recipes: { [RecipeId.Coal]: rational.one },
      };
      service['addRecipeStep'](
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.Coal],
        solution,
        state,
        mocks.objectives()[4] as any,
      );
      expect(service['adjustPowerPollution']).toHaveBeenCalled();
      expect(state.steps).toEqual([
        {
          id: '0',
          recipeId: RecipeId.Coal,
          machines: rational.one,
          recipe: recipesStore.adjustedDataset().adjustedRecipe[RecipeId.Coal],
          recipeObjectiveId: mocks.objectives()[4].id,
        },
      ]);
    });

    it('should place a new step next to related steps', () => {
      spyOn<any>(service, 'adjustPowerPollution');
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
      service['addRecipeStep'](
        recipesStore.adjustedDataset().adjustedRecipe[
          RecipeId.AdvancedOilProcessing
        ],
        solution,
        state,
      );
      expect(service['adjustPowerPollution']).toHaveBeenCalled();
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
            recipesStore.adjustedDataset().adjustedRecipe[
              RecipeId.AdvancedOilProcessing
            ],
        },
        { id: '1', itemId: ItemId.Wood, items: rational.zero },
      ]);
    });
  });

  describe('adjustPowerPollution', () => {
    it('should handle no machines', () => {
      const step: any = { machines: null };
      const result = spread(step);
      service['adjustPowerPollution'](
        result,
        recipesStore.adjustedDataset().adjustedRecipe[RecipeId.WoodenChest],
        settingsStore.dataset(),
      );
      expect(result).toEqual(step);
    });

    it('should handle null drain/consumption/pollution', () => {
      const step: any = { machines: rational.one };
      const result = spread(step);
      const recipe: any = { drain: null, consumption: null, pollution: null };
      service['adjustPowerPollution'](result, recipe, settingsStore.dataset());
      expect(result).toEqual(step);
    });

    it('should handle only drain', () => {
      const step: any = { machines: rational.one };
      const result = spread(step);
      const recipe: any = {
        drain: rational(2n),
        consumption: null,
        pollution: null,
      };
      service['adjustPowerPollution'](result, recipe, settingsStore.dataset());
      expect(result).toEqual({
        machines: rational.one,
        power: rational(2n),
      });
    });

    it('should handle account for non-cumulative DSP drain', () => {
      const step: any = { machines: rational(1n, 3n) };
      const result = spread(step);
      const recipe: any = {
        drain: rational(2n),
        consumption: null,
        pollution: null,
      };
      const data = mocks.getDataset();
      data.flags = new Set(['inactiveDrain']);
      service['adjustPowerPollution'](result, recipe, data);
      expect(result).toEqual({
        machines: rational(1n, 3n),
        power: rational(4n, 3n),
      });
    });

    it('should handle only consumption', () => {
      const step: any = { machines: rational.one };
      const result = spread(step);
      const recipe: any = {
        drain: null,
        consumption: rational(2n),
        pollution: null,
      };
      service['adjustPowerPollution'](result, recipe, settingsStore.dataset());
      expect(result).toEqual({
        machines: rational.one,
        power: rational(2n),
      });
    });

    it('should calculate power/pollution', () => {
      const step: any = { machines: rational(3n, 2n) };
      const recipe: any = {
        drain: rational(3n),
        consumption: rational(4n),
        pollution: rational(5n),
      };
      service['adjustPowerPollution'](step, recipe, settingsStore.dataset());
      expect(step).toEqual({
        machines: rational(3n, 2n),
        power: rational(12n),
        pollution: rational(15n, 2n),
      });
    });
  });
});
