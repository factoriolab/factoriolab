import { Theme } from '~/state/preferences/theme';
import { Language } from '~/translate/language';

import { StepDetailSection } from '../objectives/step-detail-section';
import { ColumnsState, initialColumnsState } from './columns-state';
import { FlowSettings, initialFlowSettings } from './flow-settings';
import { PowerUnit } from './power-unit';

export interface PreferencesState {
  states: Record<string, Record<string, string>>;
  columns: ColumnsState;
  language: Language;
  powerUnit: PowerUnit;
  hue: number;
  chroma: number;
  backgroundLightness?: number;
  theme: Theme;
  bypassLanding: boolean;
  showTechLabels: boolean;
  pinObjectives: boolean;
  paused: boolean;
  convertObjectiveValues: boolean;
  flowSettings: FlowSettings;
  sections: Record<StepDetailSection, boolean>;
}

export const initialPreferencesState: PreferencesState = {
  states: {},
  columns: initialColumnsState,
  language: 'en',
  powerUnit: PowerUnit.Auto,
  hue: 256,
  chroma: 100,
  theme: 'system',
  bypassLanding: false,
  showTechLabels: false,
  pinObjectives: false,
  paused: false,
  convertObjectiveValues: false,
  flowSettings: initialFlowSettings,
  sections: {
    sources: true,
    destinations: true,
    depletion: true,
    inputs: true,
    outputs: true,
  },
};
