import { DialogRef } from '@angular/cdk/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { provideRouter } from '@angular/router';
import { FastAverageColorResult } from 'fast-average-color';

import { SIMPLEX_CONFIG } from '~/solver/simplex-config';
import { SettingsStore } from '~/state/settings/settings-store';
import { Translate } from '~/translate/translate';
import { WindowClient } from '~/utils/window-client';

import { mockLangData, mockModData, mockModHash } from './mocks/data';

@NgModule({
  providers: [
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([]),
    { provide: DialogRef, useValue: { close: (): void => {}, config: {} } },
    {
      provide: WindowClient,
      useValue: {
        reload: (): void => {},
        clearLocalStorage: (): void => {},
        copyToClipboard: (_: string): Promise<void> => Promise.resolve(),
      },
    },
    {
      provide: SettingsStore,
      useFactory: (): SettingsStore => {
        const settingsStore = new SettingsStore();
        settingsStore.apply({ modId: '2.0', preset: 8 });
        settingsStore['modDataResource'].set(mockModData);
        settingsStore['modHashResource'].set(mockModHash);
        settingsStore['fac'].getColorAsync =
          (): Promise<FastAverageColorResult> =>
            Promise.resolve({ hex: '#000000' } as FastAverageColorResult);
        return settingsStore;
      },
    },
    {
      provide: Translate,
      useFactory: (): Translate => {
        const translate = new Translate();
        translate['httpData'].set(mockLangData);
        return translate;
      },
    },
    { provide: SIMPLEX_CONFIG, useValue: { msgLevel: 'off' } },
  ],
})
export class TestModule {}
