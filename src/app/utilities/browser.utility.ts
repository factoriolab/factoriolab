import { STATE_KEY } from '~/models';
import { State } from '~/store';

export class BrowserUtility {
  private static _storedState = BrowserUtility.loadState();
  static get storedState(): State {
    return this._storedState;
  }

  static get hash(): string {
    return (
      location.search ||
      (location.hash?.length > 1 &&
        location.hash[2] === '=' &&
        location.hash.substr(1))
    );
  }

  static get href(): string {
    return location.href;
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
      if (this.hash) {
        return {
          ...initial,
          ...{ preferencesState: state.preferencesState },
        };
      } else {
        return state;
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
