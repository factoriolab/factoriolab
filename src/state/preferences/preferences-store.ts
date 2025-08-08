import { effect, Injectable } from '@angular/core';

import { Store } from '~/state/store';
import { spread } from '~/utils/object';
import { storedSignal, storeValue } from '~/utils/stored-signal';

import { initialPreferencesState, PreferencesState } from './preferences-state';

@Injectable({ providedIn: 'root' })
export class PreferencesStore extends Store<PreferencesState> {
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
