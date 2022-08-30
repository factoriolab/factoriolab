import { TestBed } from '@angular/core/testing';

import { ItemId, Mocks, RecipeId, TestModule } from 'src/tests';
import {
  DisplayRate,
  displayRateInfo,
  Rational,
  Theme,
  themeMap,
} from '~/models';
import { FlowService } from './flow.service';

describe('FlowService', () => {
  let service: FlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(FlowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('buildGraph', () => {
    it('should handle various link and node types', () => {
      const result = service.buildGraph(
        [
          {
            id: '0',
            itemId: ItemId.CrudeOil,
            items: Rational.ten,
            recipeId: RecipeId.CrudeOil,
            factories: Rational.one,
            parents: { [RecipeId.AdvancedOilProcessing]: Rational.one },
            outputs: { [ItemId.CrudeOil]: Rational.from(1, 2) },
          },
          {
            id: '1',
            itemId: ItemId.PetroleumGas,
            items: Rational.one,
            recipeId: RecipeId.AdvancedOilProcessing,
            factories: Rational.one,
            outputs: {
              [ItemId.HeavyOil]: Rational.one,
              [ItemId.LightOil]: Rational.one,
            },
          },
          {
            id: '2',
            itemId: ItemId.HeavyOil,
            items: Rational.two,
            surplus: Rational.one,
          },
          {
            id: '3',
            itemId: ItemId.LightOil,
            items: Rational.one,
          },
        ],
        Mocks.ItemSettingsInitial,
        Mocks.RecipeSettingsInitial,
        Mocks.Dataset,
        displayRateInfo[DisplayRate.PerMinute],
        Mocks.PreferencesState.columns,
        themeMap[Theme.Light]
      );

      expect(result.nodes.length).toEqual(7);
      expect(result.links.length).toEqual(5);
    });
  });
});
