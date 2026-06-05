import { TestBed } from '@angular/core/testing';

import { Mocks } from '~/tests/mocks/mocks';
import { TestModule } from '~/tests/test-module';

import { linkValueOptions } from './link-value';

describe('LinkValue', () => {
  let mocks: Mocks;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    mocks = TestBed.inject(Mocks);
  });

  describe('linkValueOptions', () => {
    it('should return the correct options for Factorio', () => {
      expect(linkValueOptions(mocks.getDataset()).length).toEqual(6);
    });

    it('should exclude wagons if there are none', () => {
      const data = mocks.getDataset();
      data.cargoWagonIds = [];
      data.fluidWagonIds = [];
      expect(linkValueOptions(data).length).toEqual(5);
    });
  });
});
