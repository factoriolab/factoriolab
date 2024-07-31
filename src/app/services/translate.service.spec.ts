import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';

import { TestModule } from 'src/tests';
import { LangData, TranslateService } from './translate.service';

@Injectable({
  providedIn: 'root',
})
export class TestTranslateService extends TranslateService {
  protected override _getLangData(): Observable<LangData> {
    return of({});
  }
}

describe('TranslateService', () => {
  let service: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(TranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
