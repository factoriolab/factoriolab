import { Action, ActionReducer } from '@ngrx/store';

import { BrowserUtility } from '~/utilities';
import { LabState } from './';

export function storageMetaReducer(
  reducer: ActionReducer<LabState, Action>
): (state: LabState | undefined, action: Action) => LabState {
  let onInit = true;
  return function (state: LabState | undefined, action: Action): LabState {
    const nextState = reducer(state, action);

    if (onInit) {
      onInit = false;
      return BrowserUtility.mergeState(nextState);
    }

    BrowserUtility.saveState(nextState);

    return nextState;
  };
}
