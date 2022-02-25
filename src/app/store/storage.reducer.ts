import { ActionReducer, Action } from '@ngrx/store';

import { BrowserUtility } from '~/utilities';
import { State } from '.';

export function storageMetaReducer(
  reducer: ActionReducer<State, Action>
): (state: State | undefined, action: Action) => State {
  let onInit = true;
  return function (state: State | undefined, action: Action): State {
    const nextState = reducer(state, action);

    if (onInit) {
      onInit = false;
      return BrowserUtility.mergeState(nextState);
    }

    BrowserUtility.saveState(nextState);

    return nextState;
  };
}
