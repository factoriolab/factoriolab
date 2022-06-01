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
      translateSvc.use('test');
      expect(service.requestData).toHaveBeenCalledWith('1.1');
    });
  });

  describe('initialize', () => {
    it('should load stored mod', () => {
      spyOn(service, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.I18n, Mocks.Hash])
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
        new Datasets.LoadModDataAction({
          id: Mocks.Mod.id,
          value: Mocks.Data,
        })
      );
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        new Datasets.LoadModHashAction({ id: Mocks.Mod.id, value: Mocks.Hash })
      );
    });

    it('should get values from cache', () => {
      translateSvc.use('zh');
      service.cacheData['id'] = of(Mocks.Data);
      service.cacheI18n['id-zh'] = of(Mocks.I18n);
      service.cacheHash['id'] = of(Mocks.Hash);
      let data: [ModData, ModI18n | null, ModHash | null] | undefined;
      service.requestData('id').subscribe((d) => (data = d));
      expect(data).toEqual([Mocks.Data, Mocks.I18n, Mocks.Hash]);
    });

    it('should handle null defaults and skip hash', () => {
      let data: [ModData, ModI18n | null, ModHash | null] | undefined;
      service.requestData('id', true).subscribe((d) => (data = d));
      const baseData = { ...Mocks.Data, ...{ defaults: undefined } };
      http.expectOne('data/id/data.json').flush(baseData);
      expect(data).toEqual([baseData, null, null]);
    });

    it('should handle missing translations', () => {
      spyOn(console, 'warn');
      translateSvc.use('err');
      service.cacheData['id'] = of(Mocks.Data);
      service.cacheHash['id'] = of(Mocks.Hash);
      let data: [ModData, ModI18n | null, ModHash | null] | undefined;
      service.requestData('id').subscribe((d) => (data = d));
      http.expectOne('data/id/i18n/err.json').error(new ProgressEvent('error'));
      expect(data).toEqual([Mocks.Data, null, Mocks.Hash]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should load translation data', () => {
      translateSvc.use('zh');
      service.cacheData['id'] = of(Mocks.Data);
      service.cacheHash['id'] = of(Mocks.Hash);
      let data: [ModData, ModI18n | null, ModHash | null] | undefined;
      service.requestData('id').subscribe((d) => (data = d));
      http.expectOne('data/id/i18n/zh.json').flush(Mocks.I18n);
      expect(data).toEqual([Mocks.Data, Mocks.I18n, Mocks.Hash]);
    });
  });
});
