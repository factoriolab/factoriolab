import { DEFAULT_DIALOG_CONFIG, DialogConfig } from '@angular/cdk/dialog';
import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { loadModule } from 'glpk-ts';

import { Dialog } from '~/components/dialog/dialog';
import { Translate } from '~/translate/translate';

import { routes } from './app.routes';

export const APP_DIALOG_CONFIG: DialogConfig = {
  container: Dialog,
  hasBackdrop: true,
};

async function initializeApp(): Promise<unknown> {
  inject(Translate).load();
  return loadModule('glpk.all.wasm');
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: DEFAULT_DIALOG_CONFIG, useValue: APP_DIALOG_CONFIG },
    provideAppInitializer(() => initializeApp()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
