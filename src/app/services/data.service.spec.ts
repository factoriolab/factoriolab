import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { EMPTY, of } from 'rxjs';
import { Mocks, TestModule } from 'src/tests';

import { ModData, ModHash, ModI18n } from '~/models';
import { Datasets, LabState } from '~/store';

import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;
  let http: HttpTestingController;
  let mockStore: MockStore<LabState>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(DataService);
    http = TestBed.inject(HttpTestingController);
    mockStore = TestBed.inject(MockStore);
    service.initialize();
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
      http.expectOne(`data/${Mocks.Mod.id}/data.json`).flush(Mocks.Data);
      http.expectOne(`data/${Mocks.Mod.id}/hash.json`).flush(Mocks.Hash);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        Datasets.loadMod({
          id: Mocks.Mod.id,
          i18nId: Mocks.Mod.id + '-en',
          data: Mocks.Data,
          hash: Mocks.Hash,
          i18n: undefined,
        }),
      );
    });

    it('should get values from cache', () => {
      service.translateSvc.use('zh');
      service.cacheData['id'] = of(Mocks.Data);
      service.cacheI18n['id-zh'] = of(Mocks.I18n);
      service.cacheHash['id'] = of(Mocks.Hash);
      let data: [ModData, ModHash, ModI18n | null] | undefined;
      service.requestData('id').subscribe((d) => (data = d));
      expect(data).toEqual([Mocks.Data, Mocks.Hash, Mocks.I18n]);
    });

    it('should handle missing translations', () => {
      spyOn(console, 'warn');
      service.translateSvc.use('err');
      service.cacheData['id'] = of(Mocks.Data);
      service.cacheHash['id'] = of(Mocks.Hash);
      let data: [ModData, ModHash, ModI18n | null] | undefined;
      service.requestData('id').subscribe((d) => (data = d));
      http.expectOne('data/id/i18n/err.json').error(new ProgressEvent('error'));
      expect(data).toEqual([Mocks.Data, Mocks.Hash, null]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should load translation data', () => {
      service.translateSvc.use('zh');
      service.cacheData['id'] = of(Mocks.Data);
      service.cacheHash['id'] = of(Mocks.Hash);
      let data: [ModData, ModHash, ModI18n | null] | undefined;
      service.requestData('id').subscribe((d) => (data = d));
      http.expectOne('data/id/i18n/zh.json').flush(Mocks.I18n);
      expect(data).toEqual([Mocks.Data, Mocks.Hash, Mocks.I18n]);
    });
  });
});
