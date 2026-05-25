import { computed, inject, Injectable } from '@angular/core';

import { FlowData } from '~/flow/flow-data';
import { Link } from '~/flow/link';
import { Node } from '~/flow/node';
import { isRecipeObjective } from '~/state/objectives/objective';
import { RecipesStore } from '~/state/recipes/recipes-store';
import { Dataset } from '~/state/settings/dataset';
import { SettingsStore } from '~/state/settings/settings-store';
import { spread } from '~/utils/object';

import { mockModData, mockModHash, mockModInfo } from './data';
import { mockObjectivesList } from './objective';

@Injectable({ providedIn: 'root' })
export class Mocks {
  private readonly settingsStore = inject(SettingsStore);
  private readonly recipesStore = inject(RecipesStore);

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

    function link(source: string, target: string): Link {
      return {
        text: `${source}-${target}`,
        color: 'black',
        source,
        target,
        value: 1,
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
        link('r|2', 's|4'),
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

  getDataset(): Dataset {
    return this.settingsStore.computeDataset(
      mockModInfo,
      mockModData,
      mockModHash,
      undefined,
      'factorio',
    );
  }
}
