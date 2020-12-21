import { ActionReducer, Action } from '@ngrx/store';

import { STATE_KEY } from '~/models';
import { State } from '.';

export function storageMetaReducer(reducer: ActionReducer<State, Action>) {
  let onInit = true;
  return function (state: State, action: Action): State {
    const nextState = reducer(state, action);

    if (onInit) {
      onInit = false;
      return mergeState(nextState);
    }

    saveState(nextState);

    return nextState;
  };
}

export const storedState = loadState();

export function loadState(): State {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY)) as State;
  } catch (e) {
    console.warn('Failed to load state from local storage');
    console.error(e);

    // Delete local storage to repair
    localStorage.removeItem(STATE_KEY);
    return null;
  }
}

export function mergeState(initial: State): State {
  if (storedState) {
    if (location.hash) {
      return {
        ...initial,
        ...{ preferencesState: storedState.preferencesState },
      };
    } else {
      return storedState;
    }
  } else {
    return initial;
  }
}

export function saveState(state: State): void {
  const newState = { ...state };
  delete newState.datasetsState;
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}
