import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { ItemId } from '~/tests/item-id';
import { Mocks } from '~/tests/mocks/mocks';
import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { DetailRow } from './detail-row';

describe('DetailRow', () => {
  let component: DetailRow;
  let fixture: ComponentFixture<DetailRow>;
  let mocks: Mocks;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, DetailRow],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailRow);
    mocks = TestBed.inject(Mocks);
    setInputs(fixture, {
      value: { itemId: ItemId.ElectronicCircuit, items: rational(360n) },
      leftSpan: 0,
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inserterId', () => {
    it('should determine the best initial inserterId to use', async () => {
      expect(component['inserterId']()).toEqual(ItemId.FastInserter);
      setInputs(fixture, {
        value: { itemId: ItemId.ElectronicCircuit, items: rational(3600n) },
      });
      await TestBed.inject(ApplicationRef).whenStable();
      expect(component['inserterId']()).toEqual(ItemId.BulkInserter);
    });

    it('should return undefined where inserter is not relevant', () => {
      setInputs(fixture, {
        value: { itemId: ItemId.CrudeOil, items: rational(360n) },
      });
      expect(component['inserterId']()).toBeUndefined();
    });

    it('should ignore quality inserters', async () => {
      const data = mocks.getDataset();
      data.itemRecord[ItemId.FastInserter].quality = {
        id: '1',
        name: '1',
        level: 1,
      };
      spyOn<any>(component, 'data').and.returnValue(data);
      setInputs(fixture, {
        value: { itemId: ItemId.AdvancedCircuit, items: rational(360n) },
        leftSpan: 0,
      });
      await TestBed.inject(ApplicationRef).whenStable();
      expect(component['inserterId']()).toEqual(ItemId.BulkInserter);
    });
  });
});
