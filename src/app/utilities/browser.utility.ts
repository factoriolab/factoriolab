import { routes } from '~/app-routing.module';
import { fnPropsNotNullish } from '~/helpers';
import { STATE_KEY } from '~/models';
import { LabState } from '~/store';

export class BrowserUtility {
  private static _storedState = BrowserUtility.loadState();
  static get storedState(): Partial<LabState> | null {
    return this._storedState;
  }

  static get search(): string {
    return window.location.search.substring(1);
  }

  static get hash(): string {
    return window.location.hash.substring(1);
  }

  static get href(): string {
    return window.location.href;
  }

  static get zip(): string {
    const hash = this.hash;
    return this.search || (hash.length > 1 && hash[1] === '=' && hash) || '';
  }

  static redirectRoutes = routes
    .filter(fnPropsNotNullish('path', 'redirectTo'))
    .map((r) => r.path.toLowerCase());

  static get isRedirect(): boolean {
    const path = window.location.pathname.toLowerCase();
    return this.redirectRoutes.some((r) => path.endsWith(r));
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
        const applyState = { ...state };
        // Remove any unrecognized keys from the stored state before spreading
        for (const key of Object.keys(applyState) as (keyof LabState)[]) {
          if (initial[key] == null) {
            delete applyState[key];
          }
        }
        return { ...initial, ...applyState };
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
