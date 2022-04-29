import { Action } from '@ngrx/store';

import { BrowserUtility } from '~/utilities';
import { LabState } from './';
import { storageMetaReducer } from './storage.reducer';

describe('Storage MetaReducer', () => {
  it('should merge with the stored state when first called', () => {
    spyOn(BrowserUtility, 'mergeState').and.returnValue('merged' as any);
    spyOn(BrowserUtility, 'saveState');
    const state: LabState = {} as any;
    const action: Action = { type: 'type' };
    const reducer = (): LabState => state;
    expect(storageMetaReducer(reducer)(state, action)).toEqual('merged' as any);
    expect(BrowserUtility.saveState).not.toHaveBeenCalled();
  });

  it('should save the state and return the next state after first call', () => {
    const spy = spyOn(BrowserUtility, 'mergeState');
    const state: LabState = {} as any;
    const action: Action = { type: 'type' };
    const reducer = (): LabState => state;
    const fn = storageMetaReducer(reducer);
    fn(state, action);
    spy.calls.reset();
    spyOn(BrowserUtility, 'saveState');
    expect(fn(state, action)).toEqual(state);
    expect(BrowserUtility.saveState).toHaveBeenCalledWith(state);
  });
});
