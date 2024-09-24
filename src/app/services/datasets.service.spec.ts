import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { EMPTY, of } from 'rxjs';

import { ModData } from '~/models/data/mod-data';
import { ModHash } from '~/models/data/mod-hash';
import { ModI18n } from '~/models/data/mod-i18n';
import { LabState } from '~/store';
import { loadMod } from '~/store/datasets/datasets.actions';
import { Mocks, TestModule } from '~/tests';

import { DatasetsService } from './datasets.service';

describe('DatasetsService', () => {
  let service: DatasetsService;
  let http: HttpTestingController;
  let mockStore: MockStore<LabState>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(DatasetsService);
    http = TestBed.inject(HttpTestingController);
    mockStore = TestBed.inject(MockStore);
    // service.initialize();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should watch for language changes', () => {
      spyOn(service, 'requestData').and.returnValue(EMPTY);
      service.translateSvc.use('test');
      expect(service.requestData).toHaveBeenCalledWith('1.1');
    });
  });

  describe('requestData', () => {
    it('should set up http requests for data', () => {
      spyOn(mockStore, 'dispatch');
      http.expectOne(`data/${Mocks.mod.id}/data.json`).flush(Mocks.modData);
      http.expectOne(`data/${Mocks.mod.id}/hash.json`).flush(Mocks.modHash);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        loadMod({
          id: Mocks.mod.id,
          i18nId: Mocks.mod.id + '-en',
          data: Mocks.modData,
          hash: Mocks.modHash,
          i18n: undefined,
        }),
      );
    });

    it('should get values from cache', () => {
      service.translateSvc.use('zh');
      service.cacheData.id = of(Mocks.modData);
      service.cacheI18n['id-zh'] = of(Mocks.modI18n);
      service.cacheHash.id = of(Mocks.modHash);
      let data: [ModData, ModHash, ModI18n | null] | undefined;
      service.requestData('id').subscribe((d) => (data = d));
      expect(data).toEqual([Mocks.modData, Mocks.modHash, Mocks.modI18n]);
    });

    it('should handle missing translations', () => {
      spyOn(console, 'warn');
      service.translateSvc.use('err');
      service.cacheData.id = of(Mocks.modData);
      service.cacheHash.id = of(Mocks.modHash);
      let data: [ModData, ModHash, ModI18n | null] | undefined;
      service.requestData('id').subscribe((d) => (data = d));
      http.expectOne('data/id/i18n/err.json').error(new ProgressEvent('error'));
      expect(data).toEqual([Mocks.modData, Mocks.modHash, null]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should load translation data', () => {
      service.translateSvc.use('zh');
      service.cacheData.id = of(Mocks.modData);
      service.cacheHash.id = of(Mocks.modHash);
      let data: [ModData, ModHash, ModI18n | null] | undefined;
      service.requestData('id').subscribe((d) => (data = d));
      http.expectOne('data/id/i18n/zh.json').flush(Mocks.modI18n);
      expect(data).toEqual([Mocks.modData, Mocks.modHash, Mocks.modI18n]);
    });
  });
});
