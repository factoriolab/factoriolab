import { initialColumnsState } from '~/state/preferences/columns-state';
import { initialFlowSettings } from '~/state/preferences/flow-settings';
import { PowerUnit } from '~/state/preferences/power-unit';
import {
  initialPreferencesState,
  PreferencesState,
} from '~/state/preferences/preferences-state';

import { mockModId } from './data';

export const mockPreferencesState: PreferencesState = {
  states: {
    [mockModId]: { ['name']: 'z=zip' },
  },
  columns: initialColumnsState,
  powerUnit: PowerUnit.Auto,
  language: 'en',
  hue: 0,
  chroma: 100,
  theme: 'dark',
  bypassLanding: false,
  showTechLabels: false,
  paused: false,
  convertObjectiveValues: false,
  flowSettings: initialFlowSettings,
  sections: initialPreferencesState.sections,
};
