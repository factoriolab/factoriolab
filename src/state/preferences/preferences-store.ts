import { DOCUMENT, effect, inject, Injectable } from '@angular/core';

import { Store } from '~/state/store';
import { applyHue } from '~/utils/color';
import { log } from '~/utils/log';
import { spread } from '~/utils/object';
import { storedSignal, storeValue } from '~/utils/stored-signal';

import { StepDetailSection } from '../objectives/step-detail-section';
import { initialPreferencesState, PreferencesState } from './preferences-state';

@Injectable({ providedIn: 'root' })
export class PreferencesStore extends Store<PreferencesState> {
  private readonly document = inject(DOCUMENT);

  readonly stored = storedSignal('preferences');

  readonly bypassLanding = this.select('bypassLanding');
  readonly columns = this.select('columns');
  readonly convertObjectiveValues = this.select('convertObjectiveValues');
  readonly flowSettings = this.select('flowSettings');
  readonly language = this.select('language');
  readonly paused = this.select('paused');
  readonly powerUnit = this.select('powerUnit');
  readonly showTechLabels = this.select('showTechLabels');
  readonly states = this.select('states');
  readonly theme = this.select('theme');
  readonly hue = this.select('hue');

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
      const theme = this.theme();
      if (
        theme === 'light' ||
        (theme === 'system' &&
          window.matchMedia('(prefers-color-scheme: light)').matches)
      ) {
        this.document.documentElement.setAttribute('data-theme', 'light');
      } else {
        this.document.documentElement.removeAttribute('data-theme');
      }
    });

    effect(() => {
      const hue = this.hue();
      applyHue(hue, 'brand', this.document.documentElement);
      applyHue(hue + 180, 'complement', this.document.documentElement);
    });

    effect(() => {
      log('set_lang', this.language());
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

  setSectionDefault(section: StepDetailSection, value: boolean): void {
    this.update((state) => {
      return spread(state, {
        sections: spread(state.sections, { [section]: value }),
      });
    });
  }
}
