import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { Language } from '~/models/enum/language';
import { Preset } from '~/models/enum/preset';
import {
  DEFAULT_LANGUAGE,
  TranslateService,
} from '~/services/translate.service';
import { TestTranslateService } from '~/services/translate.service.spec';
import { DatasetsService } from '~/store/datasets.service';
import { SettingsService } from '~/store/settings.service';

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
        datasetsSvc.loadData('1.1', Mocks.modData, Mocks.modHash);
        datasetsSvc.loadI18n('1.1', Language.Chinese, Mocks.modI18n);
        return datasetsSvc;
      },
    },
    {
      provide: SettingsService,
      useFactory: (): SettingsService => {
        const settingsSvc = new SettingsService();
        settingsSvc.apply({ modId: '1.1', preset: Preset.Beacon8 });
        return settingsSvc;
      },
    },
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([]),
  ],
})
export class TestModule {}
