import { TestBed } from '@angular/core/testing';

import { Mocks } from '~/tests/mocks/mocks';
import { TestModule } from '~/tests/test-module';

import { Dataset } from './dataset';
import { presetOptions } from './preset';

describe('Preset', () => {
  let mocks: Mocks;
  let data: Dataset;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    mocks = TestBed.inject(Mocks);
    data = mocks.getDataset();
  });

  describe('presetOptions', () => {
    it('should return values from the JSON data', () => {
      expect(
        presetOptions(data, { presets: [{ id: 1, label: 'label' }] }).length,
      ).toEqual(1);
    });

    it('should return Factorio preset options', () => {
      expect(presetOptions(data).length).toEqual(4);
    });

    it('should return DSP preset options', () => {
      data.flags = new Set(['proliferator']);
      data.beaconIds = [];
      expect(presetOptions(data).length).toEqual(3);
    });
  });
});
