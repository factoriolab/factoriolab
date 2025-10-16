import { Theme } from '~/state/preferences/theme';
import { Language } from '~/translate/language';

import { ColumnsState, initialColumnsState } from './columns-state';
import { FlowDiagram } from './flow-diagram';
import { FlowSettingsState } from './flow-settings-state';
import { LinkValue } from './link-value';
import { PowerUnit } from './power-unit';
import { SankeyAlign } from './sankey-align';

export interface PreferencesState {
  states: Record<string, Record<string, string>>;
  columns: ColumnsState;
  language: Language;
  powerUnit: PowerUnit;
  hue: number;
  theme: Theme;
  bypassLanding: boolean;
  showTechLabels: boolean;
  paused: boolean;
  convertObjectiveValues: boolean;
  flowSettings: FlowSettingsState;
}

export const initialPreferencesState: PreferencesState = {
  states: {},
  columns: initialColumnsState,
  language: 'en',
  powerUnit: PowerUnit.Auto,
  hue: 256,
  theme: 'system',
  bypassLanding: false,
  showTechLabels: false,
  paused: false,
  convertObjectiveValues: false,
  flowSettings: {
    diagram: FlowDiagram.Sankey,
    linkSize: LinkValue.Items,
    linkText: LinkValue.Items,
    sankeyAlign: SankeyAlign.Justify,
    hideExcluded: false,
  },
};
