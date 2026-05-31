import { computed, inject, Injectable } from '@angular/core';

import { FlowData } from '~/flow/flow-data';
import { Link } from '~/flow/link';
import { Node } from '~/flow/node';
import { rational } from '~/rational/rational';
import { Step } from '~/solver/step';
import { Adjustment } from '~/state/adjustment';
import { ItemsStore } from '~/state/items/items-store';
import { MachinesStore } from '~/state/machines/machines-store';
import { isRecipeObjective } from '~/state/objectives/objective';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { RecipeSettings } from '~/state/recipes/recipe-settings';
import { RecipeState } from '~/state/recipes/recipe-state';
import { RecipesStore } from '~/state/recipes/recipes-store';
import { AdjustedDataset, Dataset } from '~/state/settings/dataset';
import { SettingsStore } from '~/state/settings/settings-store';
import { spread } from '~/utils/object';

import { ItemId } from '../item-id';
import { RecipeId } from '../recipe-id';
import { mockModData, mockModHash, mockModInfo } from './data';
import {
  mockObjective1,
  mockObjective2,
  mockObjectivesList,
} from './objective';
import { mockRecipeSettings } from './recipe';

@Injectable({ providedIn: 'root' })
export class Mocks {
  readonly adjustment = inject(Adjustment);
  readonly settingsStore = inject(SettingsStore);
  readonly recipesStore = inject(RecipesStore);
  readonly preferencesStore = inject(PreferencesStore);
  readonly itemsStore = inject(ItemsStore);
  readonly machinesStore = inject(MachinesStore);

  readonly flow = computed<FlowData>(() => {
    const data = this.settingsStore.dataset();
    const icon = data.iconRecord.item[data.itemIds[0]];
    const qualityIcon = data.iconRecord.system['custom'];
    const recipeIcon = data.iconRecord.recipe[data.recipeIds[0]];
    const recipeQualityIcon = qualityIcon;

    function node(id: string, override?: Partial<Node>): Node {
      const result: Node = {
        name: id,
        text: id,
        color: 'black',
        id,
        stepId: id,
        icon,
        qualityIcon,
        recipeIcon,
        recipeQualityIcon,
        recipeObjectiveId: id,
      };

      if (override) return spread(result, override);
      return result;
    }

    function link(source: string, target: string, bidi?: boolean): Link {
      return {
        text: `${source}-${target}`,
        color: 'black',
        source,
        target,
        value: 1,
        bidi,
      };
    }

    return {
      nodes: [
        node('r|0'),
        node('r|1'),
        node('r|2', {
          machines: '1',
          machineId: 'machineId',
          recipe: data.recipeRecord[data.recipeIds[0]],
        }),
        node('o|3'),
        node('s|4'),
      ],
      links: [
        link('r|0', 'r|2'),
        link('r|1', 'r|2'),
        link('r|2', 'r|2'),
        link('r|2', 'o|3'),
        link('r|2', 's|4', true),
      ],
    };
  });
  readonly objectives = computed(() => {
    const data = this.recipesStore.adjustedDataset();
    return mockObjectivesList.map((o) =>
      spread(o, {
        recipe: isRecipeObjective(o)
          ? data.adjustedRecipe[o.targetId]
          : undefined,
      }),
    );
  });
  readonly item1 = computed(() => {
    const data = this.settingsStore.dataset();
    return data.itemRecord[data.itemIds[0]];
  });
  readonly item2 = computed(() => {
    const data = this.settingsStore.dataset();
    return data.itemRecord[data.itemIds[1]];
  });
  readonly step1 = computed((): Step => {
    const item = this.item1();
    return {
      id: item.id,
      itemId: item.id,
      recipeId: item.id,
      items: mockObjective1.value,
      belts: rational(1n, 2n),
      wagons: rational(2n),
      machines: rational.one,
      power: rational.one,
      pollution: rational.one,
    };
  });
  readonly step2 = computed((): Step => {
    const item = this.item2();
    return {
      id: item.id,
      itemId: item.id,
      recipeId: item.id,
      items: mockObjective2.value,
      belts: rational.one,
      wagons: rational.one,
      machines: rational(2n),
      power: rational.one,
      pollution: rational.one,
    };
  });
  readonly steps = computed(() => [this.step1(), this.step2()]);
  readonly lightOilSteps = computed((): Step[] => {
    const recipesState = this.recipesStore.settings();
    return [
      {
        id: '0',
        itemId: ItemId.LightOil,
        items: rational(60n),
        output: rational(60n),
        machines: rational(1n, 51n),
        recipeId: RecipeId.HeavyOilCracking,
        recipeSettings: recipesState[RecipeId.HeavyOilCracking],
        parents: {
          '': rational.one,
        },
        outputs: { [ItemId.LightOil]: rational(5n, 17n) },
      },
      {
        id: '3',
        itemId: ItemId.HeavyOil,
        items: rational(4000n, 17n),
        machines: rational(4n, 51n),
        recipeId: RecipeId.AdvancedOilProcessing,
        recipeSettings: recipesState[RecipeId.AdvancedOilProcessing],
        parents: { '0': rational.one },
        outputs: {
          [ItemId.HeavyOil]: rational.one,
          [ItemId.LightOil]: rational(12n, 17n),
          [ItemId.PetroleumGas]: rational.one,
        },
      },
      {
        id: '2',
        itemId: ItemId.CrudeOil,
        items: rational(1600n, 17n),
        machines: rational(8n, 51n),
        recipeId: RecipeId.CrudeOil,
        recipeSettings: recipesState[RecipeId.CrudeOil],
        parents: { '3': rational.one },
        outputs: { [ItemId.CrudeOil]: rational.one },
      },
      {
        id: '4',
        itemId: ItemId.PetroleumGas,
        items: rational(880n, 17n),
        surplus: rational(880n, 17n),
      },
      {
        id: '1',
        itemId: ItemId.Water,
        items: rational(1100n, 17n),
        machines: rational(11n, 12240n),
        recipeId: RecipeId.Water,
        recipeSettings: recipesState[RecipeId.Water],
        outputs: { [ItemId.Water]: rational.one },
        parents: {
          '0': rational(3n, 11n),
          '1': rational(8n, 11n),
        },
      },
    ];
  });
  readonly recipeSettings = computed(() => {
    const dataset = this.settingsStore.dataset();
    const recipesState: Record<string, RecipeSettings> = {};
    for (const recipe of dataset.recipeIds.map((i) => dataset.recipeRecord[i]))
      recipesState[recipe.id] = spread(mockRecipeSettings);
    return recipesState;
  });

  getDataset(): Dataset {
    return this.settingsStore.computeDataset(
      mockModInfo,
      mockModData,
      mockModHash,
      undefined,
      'factorio',
    );
  }

  getAdjustedDataset(): AdjustedDataset {
    return this.adjustment.adjustDataset(
      this.recipesStore.settings(),
      this.itemsStore.settings(),
      this.settingsStore.settings(),
      this.getDataset(),
    );
  }

  getRecipesState(): Record<string, RecipeState> {
    return this.recipesStore.computeRecipesSettings(
      {},
      this.machinesStore.settings(),
      this.settingsStore.settings(),
      this.settingsStore.dataset(),
    );
  }
}
