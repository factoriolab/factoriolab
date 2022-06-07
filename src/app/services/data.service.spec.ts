import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, of } from 'rxjs';

import { Mocks, TestModule } from 'src/tests';
import { ModData, ModHash, ModI18n } from '~/models';
import { LabState } from '~/store';
import * as Datasets from '~/store/datasets';
import * as Products from '~/store/products';
import * as Settings from '~/store/settings';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;
  let http: HttpTestingController;
  let mockStore: MockStore<LabState>;
  let translateSvc: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(DataService);
    http = TestBed.inject(HttpTestingController);
    mockStore = TestBed.inject(MockStore);
    translateSvc = TestBed.inject(TranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should watch for language changes', () => {
      spyOn(service, 'requestData').and.returnValue(EMPTY);
      translateSvc.use('test'); // Skips one
      translateSvc.use('test2');
      expect(service.requestData).toHaveBeenCalledWith('1.1');
    });
  });

  describe('initialize', () => {
    it('should load stored mod', () => {
      spyOn(service, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, Mocks.I18n])
      );
      spyOn(mockStore, 'dispatch');
      service.initialize(
        '',
        { settingsState: { modId: Mocks.Mod.id } as any },
        Settings.initialSettingsState
      );
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        new Products.ResetAction(Mocks.Mod.items[0].id)
      );
    });
  });

  describe('requestData', () => {
    it('should set up http requests for data', () => {
      spyOn(mockStore, 'dispatch');
      http.expectOne(`data/${Mocks.Mod.id}/data.json`).flush(Mocks.Data);
      http.expectOne(`data/${Mocks.Mod.id}/hash.json`).flush(Mocks.Hash);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        new Datasets.LoadModAction({
          data: {
            id: Mocks.Mod.id,
            value: Mocks.Data,
          },
          hash: { id: Mocks.Mod.id, value: Mocks.Hash },
          i18n: null,
        })
      );
    });

    it('should get values from cache', () => {
      translateSvc.use('zh');
      service.cacheData['id'] = of(Mocks.Data);
      service.cacheI18n['id-zh'] = of(Mocks.I18n);
      service.cacheHash['id'] = of(Mocks.Hash);
      let data: [ModData, ModHash, ModI18n | null] | undefined;
      service.requestData('id').subscribe((d) => (data = d));
      expect(data).toEqual([Mocks.Data, Mocks.Hash, Mocks.I18n]);
    });

    it('should handle missing translations', () => {
      spyOn(console, 'warn');
      translateSvc.use('err');
      service.cacheData['id'] = of(Mocks.Data);
      service.cacheHash['id'] = of(Mocks.Hash);
      let data: [ModData, ModHash, ModI18n | null] | undefined;
      service.requestData('id').subscribe((d) => (data = d));
      http.expectOne('data/id/i18n/err.json').error(new ProgressEvent('error'));
      expect(data).toEqual([Mocks.Data, Mocks.Hash, null]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should load translation data', () => {
      translateSvc.use('zh');
      service.cacheData['id'] = of(Mocks.Data);
      service.cacheHash['id'] = of(Mocks.Hash);
      let data: [ModData, ModHash, ModI18n | null] | undefined;
      service.requestData('id').subscribe((d) => (data = d));
      http.expectOne('data/id/i18n/zh.json').flush(Mocks.I18n);
      expect(data).toEqual([Mocks.Data, Mocks.Hash, Mocks.I18n]);
    });
  });
});
