import { computed, inject, Injectable } from '@angular/core';

import { FlowData } from '~/flow/flow-data';
import { Link } from '~/flow/link';
import { Node } from '~/flow/node';
import { SettingsStore } from '~/state/settings/settings-store';
import { spread } from '~/utils/object';

@Injectable({ providedIn: 'root' })
export class Mocks {
  private readonly settingsStore = inject(SettingsStore);

  readonly flow = computed<FlowData>(() => {
    const data = this.settingsStore.dataset();
    const icon = data.iconRecord.system['custom'];

    function node(id: string, override?: Partial<Node>): Node {
      const result: Node = {
        name: id,
        text: id,
        color: 'black',
        id,
        stepId: id,
        icon,
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
}
