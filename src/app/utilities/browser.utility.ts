import { STATE_KEY } from '~/models';
import { LabState } from '~/store';

export class BrowserUtility {
  private static _storedState = BrowserUtility.loadState();
  static get storedState(): Partial<LabState> | null {
    return this._storedState;
  }

  static get search(): string {
    return location.search.substring(1);
  }

  static get hash(): string {
    return location.hash.substring(1);
  }

  static get href(): string {
    return location.href;
  }

  static get zip(): string {
    const hash = this.hash;
    return this.search || (hash.length > 1 && hash[1] === '=' && hash) || '';
  }

  static loadState(): Partial<LabState> | null {
    try {
      const stored = localStorage.getItem(STATE_KEY);
      if (stored) {
        return JSON.parse(stored) as Partial<LabState>;
      }
    } catch (e) {
      console.error('Failed to load state from local storage');
      console.error(e);

      // Delete local storage to repair
      localStorage.removeItem(STATE_KEY);
    }
    return null;
  }

  static mergeState(initial: LabState): LabState {
    const state = BrowserUtility.storedState;
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
        const merge = { ...initial };
        for (const key of Object.keys(merge) as (keyof LabState)[]) {
          merge[key] = {
            ...merge[key],
            ...(state[key] as any),
          };
        }
        return merge;
      }
    } else {
      return initial;
    }
  }

  static saveState(state: LabState): void {
    const newState = { ...state } as Partial<LabState>;
    delete newState.datasetsState;
    localStorage.setItem(STATE_KEY, JSON.stringify(newState));
  }
}
