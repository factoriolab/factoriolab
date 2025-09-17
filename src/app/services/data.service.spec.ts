import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EMPTY } from 'rxjs';

import { Language } from '~/models/enum/language';
import { Mocks, TestModule } from '~/tests';

import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(DataService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('effects', () => {
    it('should handle undefined mod id', () => {
      spyOn(service, 'requestData');
      service.settingsSvc.apply({ modId: undefined });
      TestBed.flushEffects();
      expect(service.requestData).not.toHaveBeenCalled();
    });

    it('should load i18n', () => {
      spyOn(service, 'requestI18n').and.returnValue(EMPTY);
      service.preferencesSvc.apply({ language: Language.Chinese });
      TestBed.flushEffects();
      expect(service.requestI18n).toHaveBeenCalled();
    });
  });

  describe('requestData', () => {
    it('should load the data into the datasets service', () => {
      TestBed.flushEffects();
      spyOn(service.datasetsSvc, 'loadData');
      http.expectOne('data/1.1/data.json').flush(Mocks.modData);
      http.expectOne('data/1.1/hash.json').flush(Mocks.modHash);
      expect(service.datasetsSvc.loadData).toHaveBeenCalledWith(
        '1.1',
        Mocks.modData,
        Mocks.modHash,
      );
    });

    it('should handle missing data', () => {
      TestBed.flushEffects();
      spyOn(service.error$, 'next');
      http
        .expectOne('data/1.1/data.json')
        .flush('', { status: 404, statusText: 'error' });
      expect(service.error$.next).toHaveBeenCalled();
    });
  });

  describe('requestI18n', () => {
    it('should load the i18n into the datasets service', () => {
      service.preferencesSvc.apply({ language: Language.Chinese });
      TestBed.flushEffects();
      spyOn(service.datasetsSvc, 'loadI18n');
      http.expectOne('data/1.1/i18n/zh.json').flush(Mocks.modI18n);
      expect(service.datasetsSvc.loadI18n).toHaveBeenCalledWith(
        '1.1',
        Language.Chinese,
        Mocks.modI18n,
      );
    });

    it('should handle missing data', () => {
      service.preferencesSvc.apply({ language: Language.Chinese });
      TestBed.flushEffects();
      spyOn(service.datasetsSvc, 'loadI18n');
      http
        .expectOne('data/1.1/i18n/zh.json')
        .flush('', { status: 404, statusText: 'error' });
      expect(service.datasetsSvc.loadI18n).not.toHaveBeenCalled();
    });
  });
});
