import { STATE_KEY } from '~/models';
import { LabState } from '~/store';

export class BrowserUtility {
  private static _storedState = BrowserUtility.loadState();
  static get storedState(): LabState {
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
    return this.search || (hash.length > 1 && hash[1] === '=' && hash);
  }

  static loadState(): LabState {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY)) as LabState;
    } catch (e) {
      console.error('Failed to load state from local storage');
      console.error(e);

      // Delete local storage to repair
      localStorage.removeItem(STATE_KEY);
      return null;
    }
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
        for (const key of Object.keys(merge)) {
          merge[key] = {
            ...merge[key],
            ...state[key],
          };
        }
        return merge;
      }
    } else {
      return initial;
    }
  }

  static saveState(state: LabState): void {
    const newState = { ...state };
    delete newState.datasetsState;
    localStorage.setItem(STATE_KEY, JSON.stringify(newState));
  }
}
