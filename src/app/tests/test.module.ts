import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';

import { DEFAULT_LANGUAGE, TranslateService } from '~/services';
import { TestTranslateService } from '~/services/translate.service.spec';

import { initialState } from './state';

@NgModule({
  imports: [NoopAnimationsModule],
  providers: [
    { provide: DEFAULT_LANGUAGE, useValue: 'en' },
    { provide: TranslateService, useClass: TestTranslateService },
    provideMockStore({ initialState }),
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([]),
  ],
})
export class TestModule {}
