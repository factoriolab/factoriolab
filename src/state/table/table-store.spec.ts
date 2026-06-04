import { TestBed } from '@angular/core/testing';

import { TableStore } from './table-store';

describe('TableStore', () => {
  let service: TableStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableStore);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('setSort', () => {
    it('should apply sort settings', () => {
      service.setSort('sort');
      expect(service.state()).toEqual({
        sort: 'sort',
        asc: false,
        page: 0,
        rows: 100,
      });
      service.setSort('sort');
      expect(service.state()).toEqual({
        sort: 'sort',
        asc: true,
        page: 0,
        rows: 100,
      });
      service.setSort('sort');
      expect(service.state()).toEqual({
        sort: undefined,
        asc: false,
        page: 0,
        rows: 100,
      });
    });
  });
});
