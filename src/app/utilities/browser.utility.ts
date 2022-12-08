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

  static mergeState(initial: LabState): LabState {
    const preferencesState = BrowserUtility.preferencesState;
    if (preferencesState) {
      return {
        ...initial,
        ...{
          preferencesState: {
            ...initial.preferencesState,
            ...preferencesState,
          },
        },
      };
    } else {
      return initial;
    }
  }

  static get modState(): string | null {
    return localStorage.getItem(StorageKey.Mod);
  }

  static set modState(value: string | null) {
    if (value == null) {
      localStorage.removeItem(StorageKey.Mod);
    } else {
      localStorage.setItem(StorageKey.Mod, value);
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
