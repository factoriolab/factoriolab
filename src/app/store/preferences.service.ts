import { effect, inject, Injectable } from '@angular/core';

import { spread } from '~/helpers';
import { FlowDiagram } from '~/models/enum/flow-diagram';
import { Language } from '~/models/enum/language';
import { LinkValue } from '~/models/enum/link-value';
import { PowerUnit } from '~/models/enum/power-unit';
import { SankeyAlign } from '~/models/enum/sankey-align';
import { Theme } from '~/models/enum/theme';
import {
  ColumnsState,
  initialColumnsState,
} from '~/models/settings/column-settings';
import { FlowSettings } from '~/models/settings/flow-settings';
import { storedSignal, storeValue } from '~/models/stored-signal';
import { Entities } from '~/models/utils';

import { AnalyticsService } from '../services/analytics.service';
import { TranslateService } from '../services/translate.service';
import { Store } from './store';

export interface PreferencesState {
  states: Record<string, Entities>;
  columns: ColumnsState;
  language: Language;
  powerUnit: PowerUnit;
  theme: Theme;
  bypassLanding: boolean;
  showTechLabels: boolean;
  hideDuplicateIcons: boolean;
  rows: number;
  disablePaginator: boolean;
  paused: boolean;
  convertObjectiveValues: boolean;
  flowSettings: FlowSettings;
}

export const initialPreferencesState: PreferencesState = {
  states: {},
  columns: initialColumnsState,
  language: Language.English,
  powerUnit: PowerUnit.Auto,
  theme: Theme.Dark,
  bypassLanding: false,
  showTechLabels: false,
  hideDuplicateIcons: false,
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

@Injectable({
  providedIn: 'root',
})
export class PreferencesService extends Store<PreferencesState> {
  analyticsSvc = inject(AnalyticsService);
  translateSvc = inject(TranslateService);

  stored = storedSignal('preferences');

  bypassLanding = this.select('bypassLanding');
  columns = this.select('columns');
  convertObjectiveValues = this.select('convertObjectiveValues');
  flowSettings = this.select('flowSettings');
  language = this.select('language');
  paused = this.select('paused');
  powerUnit = this.select('powerUnit');
  showTechLabels = this.select('showTechLabels');
  states = this.select('states');
  theme = this.select('theme');

  constructor() {
    super(initialPreferencesState, ['states', 'flowSettings']);
    const stored = this.stored();
    if (stored) {
      try {
        const storedState = JSON.parse(stored) as PreferencesState;
        this.load(storedState);
      } catch (ex) {
        console.warn('Failed to parse stored preferences', ex);
      }
    }

    effect(() => {
      storeValue('preferences', JSON.stringify(this.state()));
    });

    effect(() => {
      const lang = this.language();
      this.translateSvc.use(lang);
      this.analyticsSvc.event('set_lang', lang);
    });
  }

  saveState(modId: string, id: string, value: string): void {
    this.update((state) => {
      const gameStates = spread(state.states[modId], { [id]: value });
      const states = spread(state.states, { [modId]: gameStates });
      return { states };
    });
  }

  removeState(modId: string, id: string): void {
    this.update((state) => {
      const gameStates = this._removeEntry(state.states[modId], id);
      const states = spread(state.states, { [modId]: gameStates });
      return { states };
    });
  }
}
