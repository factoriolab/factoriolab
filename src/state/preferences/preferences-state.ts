import { Theme } from '~/models/theme';
import { Language } from '~/translate/language';

import { ColumnsState, initialColumnsState } from './columns-state';
import { FlowDiagram } from './flow-diagram';
import { FlowSettings } from './flow-settings';
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
  rows: number;
  disablePaginator: boolean;
  paused: boolean;
  convertObjectiveValues: boolean;
  flowSettings: FlowSettings;
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
  rows: 50,
  disablePaginator: false,
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
