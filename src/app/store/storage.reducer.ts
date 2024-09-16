import { Action, ActionReducer } from '@ngrx/store';

import { BrowserUtility } from '~/utilities/browser.utility';

import { LabState } from './';

export function storageMetaReducer(
  reducer: ActionReducer<LabState>,
): (state: LabState | undefined, action: Action) => LabState {
  let onInit = true;
  return function (state: LabState | undefined, action: Action): LabState {
    const nextState = reducer(state, action);

    if (onInit) {
      onInit = false;
      return BrowserUtility.mergeState(nextState);
    }

    return nextState;
  };
}
