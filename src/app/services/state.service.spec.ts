import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';
import { ItemId } from 'src/tests';

import { Mocks } from 'src/tests';
import { reducers, metaReducers, LabState } from '~/store';
import { LoadModDataAction } from '~/store/datasets';
import { IgnoreItemAction } from '~/store/items';
import { AddAction, SetViaAction } from '~/store/products';
import { StateService } from './state.service';

describe('StateService', () => {
  let service: StateService;
  let store: Store<LabState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
    });
    service = TestBed.inject(StateService);
    store = TestBed.inject(Store);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should revert an invalid viaId', () => {
    // Load required data
    store.dispatch(new LoadModDataAction({ id: '1.1', value: Mocks.BaseData }));
    store.dispatch(new LoadModDataAction({ id: 'res', value: Mocks.ModData1 }));

    // Add product with valid viaId
    store.dispatch(new AddAction(ItemId.Pipe));
    store.dispatch(new SetViaAction({ id: '0', value: ItemId.IronOre }));

    // Spy and invalidate viaId
    spyOn(store, 'dispatch').and.callThrough();
    store.dispatch(new IgnoreItemAction(ItemId.Pipe));

    // Check viaId is auto-reset
    expect(store.dispatch).toHaveBeenCalledWith(
      new SetViaAction({ id: '0', value: null })
    );
  });
});
