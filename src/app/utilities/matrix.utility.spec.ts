import { Mocks, ItemId, RecipeId } from 'src/tests';
import { Step, Rational, toBoolEntities } from '~/models';
import { RateUtility } from './rate.utility';
import { MatrixUtility, MatrixSolver } from './matrix.utility';

describe('MatrixUtility', () => {
  describe('solveMatricesFor', () => {
    it('should return if only simple steps are found', () => {
      const steps: Step[] = [
        {
          depth: 0,
          itemId: ItemId.SteelChest,
          items: Rational.one,
          recipeId: RecipeId.SteelChest,
        },
      ];
      const result = MatrixUtility.solveMatricesFor(
        steps,
        Mocks.ItemSettingsInitial,
        Mocks.RecipeSettingsInitial,
        [],
        ItemId.Coal,
        Mocks.AdjustedData
      );
      expect(result[0].factories).toBeFalsy();
    });

    it('should return if no matrix recipes are found', () => {
      const steps: Step[] = [
        {
          depth: 0,
          itemId: ItemId.Uranium235,
          items: Rational.one,
        },
      ];
      const result = MatrixUtility.solveMatricesFor(
        steps,
        Mocks.ItemSettingsInitial,
        Mocks.RecipeSettingsInitial,
        [RecipeId.KovarexEnrichmentProcess, RecipeId.UraniumProcessing],
        ItemId.Coal,
        Mocks.AdjustedData
      );
      expect(result[0].factories).toBeFalsy();
    });

    it('should solve a matrix', () => {
      const steps: Step[] = [
        {
          depth: 0,
          itemId: ItemId.PetroleumGas,
          items: Rational.one,
        },
      ];
      const result = MatrixUtility.solveMatricesFor(
        steps,
        Mocks.ItemSettingsInitial,
        Mocks.RecipeSettingsInitial,
        [],
        ItemId.Coal,
        Mocks.AdjustedData
      );
      expect(result[0].factories).toBeTruthy();
    });
  });

  describe('solveTryCatch', () => {
    it('should return the matrix steps', () => {
      const matrix = { solve: () => {}, steps: [] } as any;
      spyOn(matrix, 'solve');
      const result = MatrixUtility.solveTryCatch(null, matrix);
      expect(matrix.solve).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle an error', () => {
      const matrix = {
        solve: () => {
          throw new Error('test');
        },
      } as any;
      spyOn(console, 'warn');
      spyOn(console, 'error');
      const result = MatrixUtility.solveTryCatch([], matrix);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });
});

describe('MatrixSolver', () => {
  let matrix: MatrixSolver;

  beforeEach(() => {
    const steps: Step[] = [
      {
        depth: 0,
        itemId: ItemId.SteelChest,
        items: Rational.one,
        recipeId: RecipeId.SteelChest,
      },
    ];
    matrix = new MatrixSolver(
      steps,
      Mocks.ItemSettingsInitial,
      Mocks.RecipeSettingsInitial,
      [RecipeId.FillWaterBarrel],
      ItemId.Coal,
      Mocks.AdjustedData
    );
  });

  describe('constructor', () => {
    it('should set up recipeDisabled map from disabledRecipes array', () => {
      expect(matrix.recipeDisabled).toEqual({
        [RecipeId.FillWaterBarrel]: true,
      });
    });
  });

  describe('simpleStepsOnly', () => {
    it('should determine whether matrix contains only simple recipes', () => {
      expect(matrix.simpleStepsOnly).toBeTrue();
      matrix.steps[0].recipeId = null;
      expect(matrix.simpleStepsOnly).toBeFalse();
    });
  });

  describe('simpleRecipesOnly', () => {
    it('should determine whether matrix contains matching complex recipes', () => {
      matrix.calculateRecipes();
      expect(matrix.simpleRecipesOnly).toBeTrue();
      matrix.steps[0].itemId = ItemId.PetroleumGas;
      matrix.steps[0].recipeId = null;
      matrix.calculateRecipes();
      expect(matrix.simpleRecipesOnly).toBeFalse();
    });
  });

  describe('calculateRecipes', () => {
    it('should calculate recipes to use', () => {
      matrix.steps.push({
        depth: 0,
        itemId: ItemId.PetroleumGas,
        items: Rational.one,
      });
      matrix.steps.push({
        depth: 0,
        itemId: ItemId.LightOil,
        items: Rational.one,
      });
      matrix.recipeDisabled = toBoolEntities(
        Mocks.SettingsState1.disabledRecipes
      );
      matrix.calculateRecipes();
      expect(matrix.steps).toEqual([
        {
          depth: 0,
          itemId: ItemId.SteelChest,
          items: Rational.one,
          recipeId: RecipeId.SteelChest,
        },
        { depth: 0, itemId: ItemId.PetroleumGas, items: Rational.one },
        { depth: 0, itemId: ItemId.LightOil, items: Rational.one },
      ]);
    });

    it('should handle no recipe found', () => {
      matrix.steps = [
        {
          depth: 0,
          itemId: ItemId.Wood,
          items: Rational.one,
        },
      ];
      matrix.calculateRecipes();
      expect(matrix.steps).toEqual([
        {
          depth: 0,
          itemId: ItemId.Wood,
          items: Rational.one,
        },
      ]);
    });
  });

  describe('findRecipesRecursively', () => {
    beforeEach(() => {
      spyOn(matrix, 'parseRecipeRecursively');
    });

    it('should parse simple recipe', () => {
      matrix.findRecipesRecursively(ItemId.SteelChest);
      expect(matrix.parseRecipeRecursively).toHaveBeenCalledWith(
        Mocks.AdjustedData.recipeR[RecipeId.SteelChest]
      );
    });

    it('should parse complex recipes', () => {
      matrix.recipeDisabled[RecipeId.KovarexEnrichmentProcess] = true;
      matrix.recipeDisabled[RecipeId.NuclearFuelReprocessing] = true;
      matrix.findRecipesRecursively(ItemId.Uranium238);
      expect(matrix.parseRecipeRecursively).toHaveBeenCalledWith(
        Mocks.AdjustedData.recipeR[RecipeId.UraniumProcessing]
      );
      expect(matrix.parseRecipeRecursively).toHaveBeenCalledTimes(1);
    });
  });

  describe('parseRecipeRecursively', () => {
    beforeEach(() => {
      spyOn(matrix, 'findRecipesRecursively');
    });

    it('should ignore recipes that have already been added', () => {
      const recipe = Mocks.AdjustedData.recipeR[RecipeId.BasicOilProcessing];
      matrix.recipes[recipe.id] = recipe;
      matrix.parseRecipeRecursively(recipe);
      expect(matrix.findRecipesRecursively).not.toHaveBeenCalled();
      expect(Object.keys(matrix.recipes).length).toEqual(1);
    });

    it('should parse through recipe inputs', () => {
      const recipe = Mocks.AdjustedData.recipeR[RecipeId.BasicOilProcessing];
      matrix.parseRecipeRecursively(recipe);
      expect(matrix.findRecipesRecursively).toHaveBeenCalledWith(
        ItemId.CrudeOil
      );
      expect(Object.keys(matrix.recipes).length).toEqual(1);
    });

    it('should exit if it finds a circular reference', () => {
      spyOn(console, 'warn');
      spyOn(matrix, 'checkForCircularRecipes').and.returnValue(true);
      matrix.parseRecipeRecursively(
        Mocks.AdjustedData.recipeR[RecipeId.BasicOilProcessing]
      );
      expect(Object.keys(matrix.recipes).length).toEqual(0);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('checkForCircularRecipes', () => {
    it('should skip if no inputs', () => {
      const result = matrix.checkForCircularRecipes({} as any);
      expect(result).toBeFalse();
    });

    it('should handle no loop found', () => {
      const result = matrix.checkForCircularRecipes(
        Mocks.AdjustedData.recipeR[RecipeId.BasicOilProcessing]
      );
      expect(result).toBeFalse();
    });

    it('should handle circular loop found', () => {
      spyOn(matrix, 'checkForCircularRecursively').and.returnValue(true);
      const id = 'test';
      matrix.recipes = {
        [id]: { in: {}, out: { [ItemId.CrudeOil]: 1 } } as any,
      };
      const result = matrix.checkForCircularRecipes(
        Mocks.AdjustedData.recipeR[RecipeId.BasicOilProcessing]
      );
      expect(result).toBeTrue();
    });
  });

  describe('checkForCircularRecursively', () => {
    it('should return false if no loop is found', () => {
      const id = 'test';
      const result = matrix.checkForCircularRecursively([], {
        in: { [id]: 1 },
      } as any);
      expect(result).toBeFalse();
    });

    it('should find a circular loop', () => {
      const id = 'test';
      const result = matrix.checkForCircularRecursively([id], {
        in: { [id]: 1 },
      } as any);
      expect(result).toBeTrue();
    });

    it('should return a circular reference from a child', () => {
      const id = 'test';
      matrix.recipes = {
        [id]: {
          id,
          in: { [ItemId.Coal]: 1 },
          out: { [ItemId.CrudeOil]: 1 },
        } as any,
      };
      const result = matrix.checkForCircularRecursively(
        [ItemId.Coal],
        Mocks.AdjustedData.recipeR[RecipeId.BasicOilProcessing]
      );
      expect(result).toBeTrue();
    });
  });

  describe('solve', () => {
    it('should call the solution methods', () => {
      spyOn(matrix, 'parseRecipes');
      spyOn(matrix, 'parseItems');
      spyOn(matrix, 'parseCost');
      spyOn(matrix.solver, 'updateVariables');
      spyOn(matrix, 'parseSolutionRecipes');
      spyOn(matrix, 'parseSolutionOutputs');
      spyOn(matrix, 'parseSolutionSteps');
      spyOn(matrix, 'parseSolutionInputs');
      matrix.solve();
      expect(matrix.parseRecipes).toHaveBeenCalled();
      expect(matrix.parseItems).toHaveBeenCalled();
      expect(matrix.parseCost).toHaveBeenCalled();
      expect(matrix.solver.updateVariables).toHaveBeenCalled();
      expect(matrix.parseSolutionRecipes).toHaveBeenCalled();
      expect(matrix.parseSolutionOutputs).toHaveBeenCalled();
      expect(matrix.parseSolutionSteps).toHaveBeenCalled();
      expect(matrix.parseSolutionInputs).toHaveBeenCalled();
    });
  });

  describe('parseRecipes', () => {
    it('should parse a standard oil recipe', () => {
      matrix.recipeIds.push(RecipeId.AdvancedOilProcessing);
      matrix.parseRecipes();
      expect(Object.keys(matrix.items).length).toEqual(5);
      expect(matrix.outputs.length).toEqual(3);
      expect(matrix.recipeVar[RecipeId.AdvancedOilProcessing]).toBeTruthy();
      expect(matrix.itemIds.length).toEqual(5);
      expect(matrix.solver.variables.length).toEqual(1);
      expect(matrix.solver.constraints.length).toEqual(2);
    });

    it('should parse a recipe with no inputs', () => {
      matrix.recipeIds.push(RecipeId.IronOre);
      matrix.parseRecipes();
      expect(Object.keys(matrix.items).length).toEqual(1);
      expect(matrix.outputs.length).toEqual(1);
      expect(matrix.recipeVar[RecipeId.IronOre]).toBeTruthy();
      expect(matrix.itemIds.length).toEqual(1);
      expect(matrix.solver.variables.length).toEqual(1);
      expect(matrix.solver.constraints.length).toEqual(2);
    });

    it('should ignore duplicate items', () => {
      matrix.recipeIds.push(RecipeId.IronOre);
      matrix.recipeIds.push(RecipeId.IronOre);
      matrix.parseRecipes();
      expect(Object.keys(matrix.items).length).toEqual(1);
      expect(matrix.outputs.length).toEqual(1);
      expect(matrix.recipeVar[RecipeId.IronOre]).toBeTruthy();
      expect(matrix.itemIds.length).toEqual(1);
      expect(matrix.solver.variables.length).toEqual(2);
      expect(matrix.solver.constraints.length).toEqual(4);
    });
  });

  describe('parseItems', () => {
    it('should parse a standard item', () => {
      matrix.recipeIds.push(RecipeId.BasicOilProcessing);
      matrix.parseRecipes();
      matrix.parseItems();
      expect(Object.keys(matrix.inputVar).length).toEqual(1);
      expect(Object.keys(matrix.surplusVar).length).toEqual(2);
      expect(matrix.solver.variables.length).toEqual(4);
      expect(matrix.solver.constraints.length).toEqual(9);
    });

    it('should parse an item with desired value', () => {
      matrix.value[ItemId.PetroleumGas] = Rational.one;
      matrix.recipeIds.push(RecipeId.BasicOilProcessing);
      matrix.parseRecipes();
      matrix.parseItems();
      expect(Object.keys(matrix.inputVar).length).toEqual(1);
      expect(Object.keys(matrix.surplusVar).length).toEqual(2);
      expect(matrix.solver.variables.length).toEqual(4);
      expect(matrix.solver.constraints.length).toEqual(9);
    });

    it('should parse a recipe with no inputs', () => {
      matrix.recipeIds.push(RecipeId.IronOre);
      matrix.parseRecipes();
      matrix.parseItems();
      expect(Object.keys(matrix.inputVar).length).toEqual(0);
      expect(Object.keys(matrix.surplusVar).length).toEqual(1);
      expect(matrix.solver.variables.length).toEqual(2);
      expect(matrix.solver.constraints.length).toEqual(5);
    });
  });

  describe('parseCost', () => {
    it('should add cost constraints', () => {
      matrix.recipeIds.push(RecipeId.BasicOilProcessing);
      matrix.parseRecipes();
      matrix.parseItems();
      matrix.parseCost();
      expect(matrix.solver.variables.length).toEqual(6);
      expect(matrix.solver.constraints.length).toEqual(13);
    });

    it('should handle inputs', () => {
      matrix.recipeIds.push(RecipeId.AdvancedOilProcessing);
      matrix.recipeIds.push(RecipeId.CoalLiquefaction);
      matrix.recipeIds.push(RecipeId.WoodenChest);
      matrix.parseRecipes();
      matrix.parseItems();
      matrix.parseCost();
      expect(matrix.solver.variables.length).toEqual(19);
      expect(matrix.solver.constraints.length).toEqual(42);
    });
  });

  describe('parseSolutionRecipes', () => {
    it('should map used recipe ids', () => {
      matrix.recipeVar[RecipeId.IronOre] = { value: Rational.one } as any;
      matrix.parseSolutionRecipes();
      expect(matrix.usedRecipeIds).toEqual([RecipeId.IronOre]);
    });
  });

  describe('parseSolutionOutputs', () => {
    it('should parse outputs from solver', () => {
      matrix.steps[0].itemId = ItemId.HeavyOil;
      matrix.steps[0].recipeId = null;
      matrix.recipeDisabled = toBoolEntities(
        Mocks.SettingsState1.disabledRecipes
      );
      matrix.calculateRecipes();
      // Add dummy recipe with no inputs
      matrix.recipeIds.push(RecipeId.IronOre);
      matrix.parseRecipes();
      matrix.parseItems();
      matrix.parseCost();
      matrix.solver.updateVariables();
      // Simulate an output that has already been calculated
      matrix.steps.push({
        depth: 0,
        itemId: ItemId.LightOil,
        items: Rational.zero,
      });
      matrix.parseSolutionRecipes();
      matrix.parseSolutionOutputs();
      expect(matrix.steps).toEqual([
        {
          depth: 1,
          itemId: ItemId.HeavyOil,
          items: Rational.one,
          recipeId: RecipeId.AdvancedOilProcessing,
          factories: new Rational(BigInt(4), BigInt(15)),
          consumption: new Rational(BigInt(124), BigInt(3)),
          pollution: new Rational(BigInt(1), BigInt(75)),
        },
        {
          depth: 1,
          itemId: ItemId.LightOil,
          items: Rational.zero,
          surplus: new Rational(BigInt(9), BigInt(5)),
        },
        {
          depth: 1,
          itemId: ItemId.PetroleumGas,
          items: Rational.zero,
          surplus: new Rational(BigInt(11), BigInt(5)),
        },
        {
          depth: 1,
          itemId: ItemId.CrudeOil,
          recipeId: RecipeId.CrudeOil,
          items: new Rational(BigInt(4)),
          factories: new Rational(BigInt(8), BigInt(15)),
          consumption: new Rational(BigInt(248), BigInt(3)),
          pollution: new Rational(BigInt(2), BigInt(75)),
        },
        {
          depth: 1,
          itemId: ItemId.Water,
          recipeId: RecipeId.Water,
          items: Rational.two,
          factories: new Rational(BigInt(8), BigInt(3)),
          consumption: new Rational(BigInt(1240), BigInt(3)),
          pollution: new Rational(BigInt(2), BigInt(15)),
        },
      ]);
    });
  });

  describe('parseSolutionSteps', () => {
    it('should add steps for additional used recipes', () => {
      matrix.usedRecipeIds = [
        RecipeId.AdvancedOilProcessing,
        RecipeId.BasicOilProcessing,
      ];
      matrix.mappedRecipeIds = [RecipeId.BasicOilProcessing];
      matrix.recipeVar[RecipeId.AdvancedOilProcessing] = {
        value: Rational.one,
      } as any;
      matrix.parseSolutionSteps();
      expect(matrix.steps[1]).toEqual({
        depth: 2,
        itemId: null,
        items: null,
        recipeId: RecipeId.AdvancedOilProcessing,
        factories: new Rational(BigInt(20), BigInt(3)),
      });
    });
  });

  describe('parseSolutionInputs', () => {
    it('should add steps for solution inputs', () => {
      spyOn(RateUtility, 'addStepsFor');
      matrix.inputVar[ItemId.IronOre] = { value: Rational.one } as any;
      matrix.parseSolutionInputs();
      expect(RateUtility.addStepsFor).toHaveBeenCalledTimes(1);
    });
  });

  describe('parseSolutionParents', () => {
    it('should handle recipes with no inputs', () => {
      spyOn(RateUtility, 'addParentValue');
      matrix.usedRecipeIds = [RecipeId.IronOre];
      matrix.parseSolutionParents();
      expect(RateUtility.addParentValue).not.toHaveBeenCalled();
    });

    it('should add parent values to steps', () => {
      spyOn(RateUtility, 'addParentValue');
      matrix.usedRecipeIds = [RecipeId.CopperCable];
      matrix.recipeVar[RecipeId.CopperCable] = { value: Rational.one } as any;
      matrix.steps = [{ itemId: ItemId.CopperPlate }] as any;
      matrix.parseSolutionParents();
      expect(RateUtility.addParentValue).toHaveBeenCalledTimes(1);
    });
  });
});
