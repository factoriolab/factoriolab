import { HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';

import { TestModule } from '~/tests';

import { LangData, TranslateService } from './translate.service';

@Injectable({
  providedIn: 'root',
})
export class TestTranslateService extends TranslateService {
  protected override _getLangData(): Observable<LangData> {
    return of({});
  }
}

const MockLangData: LangData = { ok: 'OK', app: { list: 'List' } };

describe('TranslateService', () => {
  let service: TranslateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: TranslateService, useClass: TranslateService }],
      imports: [TestModule],
    });
    service = TestBed.inject(TranslateService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    service['_getLangData']('en');
  });

  describe('_getLangData', () => {
    it('should set up an http request for language data', () => {
      service['_getLangData']('en').subscribe();
      const req = http.expectOne('assets/i18n/en.json');
      expect(req.request.method).toEqual('GET');
    });
  });

  describe('currentLang', () => {
    it('should pull the current lang from its BehaviorSubject', () => {
      expect(service.currentLang).toEqual('en');
    });
  });

  describe('getValue', () => {
    it('should iterate down objects to find the string', () => {
      expect(service.getValue({ a: { b: 'c' } }, 'a.b')).toEqual('c');
    });

    it('should find keys including built in delimiters', () => {
      expect(service.getValue({ 'a.b': 'c' }, 'a.b')).toEqual('c');
    });
  });

  describe('interpolate', () => {
    it('should replace values in the string', () => {
      expect(service.interpolate('a {{ b }} d {{ c }}', { b: 'c' })).toEqual(
        'a c d {{ c }}',
      );
    });
  });

  describe('get', () => {
    it('should get the value from the current language', () => {
      let result: string | undefined;
      service.use('de');
      service.get('ok').subscribe((r) => (result = r));
      http.expectOne('assets/i18n/de.json').flush(MockLangData);
      expect(result).toEqual('OK');
    });

    it('should get the value from the default language', () => {
      let result: string | undefined;
      service.use('de');
      service.get('ok').subscribe((r) => (result = r));
      http.expectOne('assets/i18n/de.json').flush({});
      http.expectOne('assets/i18n/en.json').flush(MockLangData);
      expect(result).toEqual('OK');
    });

    it('should default to the translation key', () => {
      let result: string | undefined;
      service.use('de');
      service.get('asdf').subscribe((r) => (result = r));
      http.expectOne('assets/i18n/de.json').flush({});
      http.expectOne('assets/i18n/en.json').flush(MockLangData);
      expect(result).toEqual('asdf');
    });
  });

  describe('multi', () => {
    it('should get multiple translation strings at once', () => {
      let result: [string, string] | undefined;
      service.multi(['ok', 'app.list']).subscribe((r) => (result = r));
      http.expectOne('assets/i18n/en.json').flush(MockLangData);
      expect(result).toEqual(['OK', 'List']);
    });
  });
});
