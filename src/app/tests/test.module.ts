import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { DEFAULT_MOD } from '~/models/constants';
import { DatasetsService } from '~/services/datasets.service';
import { SettingsService } from '~/services/settings.service';
import {
  DEFAULT_LANGUAGE,
  TranslateService,
} from '~/services/translate.service';
import { TestTranslateService } from '~/services/translate.service.spec';

import { Mocks } from '.';

@NgModule({
  imports: [NoopAnimationsModule],
  providers: [
    { provide: DEFAULT_LANGUAGE, useValue: 'en' },
    { provide: TranslateService, useClass: TestTranslateService },
    {
      provide: DatasetsService,
      useFactory: (): DatasetsService => {
        const datasetsSvc = new DatasetsService();
        datasetsSvc.loadData(DEFAULT_MOD, Mocks.modData, Mocks.modHash);
        return datasetsSvc;
      },
    },
    {
      provide: SettingsService,
      useFactory: (): SettingsService => {
        const settingsSvc = new SettingsService();
        settingsSvc.apply({ modId: DEFAULT_MOD });
        return settingsSvc;
      },
    },
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([]),
  ],
})
export class TestModule {}
