import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { mockLangData } from '~/tests/mocks/data';

import { Translate } from './translate';

describe('Translate', () => {
  let service: Translate;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Translate);
    http = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('safeHttpData', () => {
    it('should handle error in resource', () => {
      spyOn(service['httpData'], 'error').and.returnValue(new Error());
      expect(service['safeHttpData']()).toBeUndefined();
    });
  });

  describe('data', () => {
    it('should handle undefined data and return previous value', () => {
      service['httpData'].set(mockLangData);
      expect(service.data()).toBeDefined();
      service['httpData'].set(null as any);
      expect(service.data()).toBeDefined();
    });
  });

  describe('load', () => {
    it('should wait for the httpData resource to load as a promise', async () => {
      const promise = service.load();
      TestBed.tick();
      http.expectOne('i18n/en.json').flush(mockLangData);
      const result = await promise;
      expect(result).toBeTrue();
    });
  });

  describe('get', () => {
    it('should interpolate from the data', () => {
      service['httpData'].set(mockLangData);
      const result = service.get('app.simplexSolved', { time: 1, cost: 2 });
      expect(result).toEqual('Solved, 1ms, cost: 2');
    });

    it('should handle null data', () => {
      expect(service.get('ok')).toEqual('ok');
    });
  });

  describe('interpolate', () => {
    it('should handle missing params', () => {
      const result = service['interpolate'](
        'Solved, {{ time }}ms, cost: {{ cost }}',
        {},
      );
      expect(result).toEqual('Solved, {{ time }}ms, cost: {{ cost }}');
    });

    it('should return early if no params', () => {
      expect(service['interpolate']('ok')).toEqual('ok');
    });
  });
});
