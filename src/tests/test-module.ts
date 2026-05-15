import { DialogRef } from '@angular/cdk/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { provideRouter } from '@angular/router';
import { FastAverageColorResult } from 'fast-average-color';

import { Preset } from '~/state/settings/preset';
import { SettingsStore } from '~/state/settings/settings-store';
import { WindowClient } from '~/utils/window-client';

import { mockModData, mockModHash } from './mocks/data';

@NgModule({
  providers: [
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([]),
    { provide: DialogRef, useValue: { close: (): void => {} } },
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
        settingsStore.apply({ modId: '1.1', preset: Preset.Beacon8 });
        settingsStore['modDataResource'].set(mockModData);
        settingsStore['modHashResource'].set(mockModHash);
        settingsStore['fac'].getColorAsync =
          (): Promise<FastAverageColorResult> =>
            Promise.resolve({ hex: '#000000' } as FastAverageColorResult);
        return settingsStore;
      },
    },
  ],
})
export class TestModule {}
