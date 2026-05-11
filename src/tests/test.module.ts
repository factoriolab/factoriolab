import { DialogRef } from '@angular/cdk/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { provideRouter } from '@angular/router';

import { WindowClient } from '~/utils/window-client';

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
  ],
})
export class TestModule {}
