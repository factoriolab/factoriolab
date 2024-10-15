import { TestBed } from '@angular/core/testing';

import { rational } from '~/models/rational';

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

  describe('sortByValue', () => {
    it('should return a diff', () => {
      expect(
        service.sortByValue(
          { key: 'a', value: rational.one },
          { key: 'b', value: rational(2n) },
        ),
      ).toEqual(1);
    });
  });
});
