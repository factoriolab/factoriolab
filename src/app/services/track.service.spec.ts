import { TestBed } from '@angular/core/testing';

import { Rational } from '~/models';
import { TrackService } from './track.service';

describe('TrackService', () => {
  let service: TrackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('trackById', () => {
    it('should return an object id', () => {
      expect(service.trackById(0, { id: 'id' })).toEqual('id');
    });
  });

  describe('trackByKey', () => {
    it('should return an object key', () => {
      expect(service.trackByKey(0, { key: 'key', value: 'value' })).toEqual(
        'key'
      );
    });
  });

  describe('sortByValue', () => {
    it('should return a diff', () => {
      expect(
        service.sortByValue(
          { key: 'a', value: Rational.one },
          { key: 'b', value: Rational.two }
        )
      ).toEqual(1);
    });
  });
});
