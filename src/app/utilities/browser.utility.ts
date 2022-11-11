import { LabState } from '~/store';
import { PreferencesState } from '~/store/preferences';

enum StorageKey {
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

  static mergeState(initial: LabState): LabState {
    const state = BrowserUtility.storedState;
    initial = { ...initial };
    if (state) {
      if (this.zip) {
        return {
          ...initial,
          ...{
            preferencesState: {
              ...initial.preferencesState,
              ...state.preferencesState,
            },
          },
        };
      } else {
        const applyState = { ...state } as LabState;
        // Remove any unrecognized keys from the stored state before spreading
        for (const key of Object.keys(applyState) as (keyof LabState)[]) {
          if (initial[key] != null) {
            if (key === 'preferencesState') {
              // Lowercase columns keys
              applyState[key] = {
                ...applyState[key],
                ...{ columns: this.toLowerKeys(applyState[key].columns) },
              };
            }

            initial = {
              ...initial,
              ...{
                [key]: {
                  ...initial[key],
                  ...applyState[key],
                },
              },
            };
          }
        }
      }
    }

    return initial;
  }

  static toLowerKeys<T>(obj: Record<string, T>): Record<string, T> {
    return Object.keys(obj).reduce((lower: Record<string, T>, b) => {
      lower[b.toLowerCase()] = obj[b];
      return lower;
    }, {});
  }

  static saveState(state: LabState): void {
    const newState = { ...state } as Partial<LabState>;
    delete newState.datasetsState;
    localStorage.setItem(STATE_KEY, JSON.stringify(newState));
  }
}
