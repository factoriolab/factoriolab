import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';
import { ItemId } from 'src/tests';

import { Mocks } from 'src/tests';
import { reducers, metaReducers, LabState } from '~/store';
import * as Datasets from '~/store/datasets';
import * as Items from '~/store/items';
import * as Products from '~/store/products';
import { StateService } from './state.service';

xdescribe('StateService', () => {
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
    store.dispatch(
      new Datasets.LoadModDataAction({ id: '1.1', value: Mocks.BaseData })
    );
    store.dispatch(
      new Datasets.LoadModDataAction({
        id: 'res',
        value: Mocks.ModData1,
      })
    );

    // Add product with valid viaId
    store.dispatch(new Products.AddAction(ItemId.Pipe));
    store.dispatch(
      new Products.SetViaAction({ id: '0', value: ItemId.IronOre })
    );

    // Spy and invalidate viaId
    spyOn(store, 'dispatch').and.callThrough();
    store.dispatch(new Items.IgnoreItemAction(ItemId.Pipe));

    // Check viaId is auto-reset
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.ResetViaAction('0')
    );
  });
});
