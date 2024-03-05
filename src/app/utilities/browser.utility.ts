import { LabState } from '~/store';
import { PreferencesState } from '~/store/preferences';

export enum StorageKey {
  Mod = 'mod',
  Router = 'router',
  Preferences = 'preferences',
}

export class BrowserUtility {
  static get search(): string {
    return window.location.search.substring(1);
  }

  static get href(): string {
    return window.location.href;
  }

  /**
   * Indicates whether app is running as a standalone PWA. Evaluates only once.
   */
  static isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  static mergeState(initial: LabState): LabState {
    let preferencesState = BrowserUtility.preferencesState;
    if (preferencesState) {
      preferencesState = {
        ...initial.preferencesState,
        ...preferencesState,
        ...{
          states: {
            ...initial.preferencesState.states,
            ...preferencesState.states,
          },
          columns: {
            ...initial.preferencesState.columns,
            ...preferencesState.columns,
          },
        },
      };
      return {
        ...initial,
        ...{ preferencesState },
      };
    } else {
      return initial;
    }
  }

  static get preferencesState(): PreferencesState | null {
    try {
      const value = localStorage.getItem(StorageKey.Preferences);
      if (value != null) {
        return JSON.parse(value) as PreferencesState;
      }
    } catch {
      this.preferencesState = null;
    }
    return null;
  }

  static set preferencesState(value: PreferencesState | null) {
    if (value == null) {
      localStorage.removeItem(StorageKey.Preferences);
    } else {
      localStorage.setItem(StorageKey.Preferences, JSON.stringify(value));
    }
  }

  static get routerState(): string | null {
    return localStorage.getItem(StorageKey.Router);
  }

  static set routerState(value: string | null) {
    if (value == null) {
      localStorage.removeItem(StorageKey.Router);
    } else {
      localStorage.setItem(StorageKey.Router, value);
    }
  }
}
