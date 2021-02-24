import { STATE_KEY } from '~/models';
import { State } from '~/store';

export class BrowserUtility {
  private static _storedState = BrowserUtility.loadState();
  static get storedState(): State {
    return this._storedState;
  }

  static get search(): string {
    return location.search.substr(1);
  }

  static get hash(): string {
    return location.hash.substr(1);
  }

  static get href(): string {
    return location.href;
  }

  static get zip(): string {
    const hash = this.hash;
    return this.search || (hash.length > 1 && hash[1] === '=' && hash);
  }

  static loadState(): State {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY)) as State;
    } catch (e) {
      console.error('Failed to load state from local storage');
      console.error(e);

      // Delete local storage to repair
      localStorage.removeItem(STATE_KEY);
      return null;
    }
  }

  static mergeState(initial: State): State {
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

  static saveState(state: State): void {
    const newState = { ...state };
    delete newState.datasetsState;
    localStorage.setItem(STATE_KEY, JSON.stringify(newState));
  }
}
