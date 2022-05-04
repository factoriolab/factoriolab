import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MemoizedSelector } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { initialState, ItemId } from 'src/tests';
import { Entities, RateType, Rational, RationalProduct } from '~/models';
import { LabState } from '~/store';
import * as Products from '~/store/products';
import { StateService } from './state.service';

describe('StateService', () => {
  let service: StateService;
  let mockStore: MockStore<LabState>;
  let mockCheckViaState: MemoizedSelector<
    LabState,
    { products: RationalProduct[]; rates: Entities<Rational> }
  >;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [provideMockStore({ initialState })],
    });
    service = TestBed.inject(StateService);
    mockStore = TestBed.inject(MockStore);
    mockCheckViaState = mockStore.overrideSelector(Products.checkViaState, {
      products: [],
      rates: {},
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should revert an invalid viaId', () => {
    spyOn(mockStore, 'dispatch');
    mockCheckViaState.setResult({
      products: [
        new RationalProduct({
          id: '0',
          itemId: ItemId.Pipe,
          rate: '1',
          rateType: RateType.Items,
          viaId: ItemId.IronOre,
        }),
      ],
      rates: { ['0']: Rational.zero },
    });
    mockStore.refreshState();
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      new Products.ResetViaAction('0')
    );
  });
});
