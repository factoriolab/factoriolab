import { TestBed } from '@angular/core/testing';
import { MemoizedSelector } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';

import { ItemId, TestModule } from 'src/tests';
import { Entities, RateType, Rational, RationalProduct } from '~/models';
import { LabState, Products } from '~/store';
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
      imports: [TestModule],
    });
    service = TestBed.inject(StateService);
    service.initialize();
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
