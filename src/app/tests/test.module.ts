import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import {
  DEFAULT_LANGUAGE,
  TranslateService,
} from '~/services/translate.service';
import { TestTranslateService } from '~/services/translate.service.spec';

@NgModule({
  imports: [NoopAnimationsModule],
  providers: [
    { provide: DEFAULT_LANGUAGE, useValue: 'en' },
    { provide: TranslateService, useClass: TestTranslateService },
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([]),
  ],
})
export class TestModule {}
