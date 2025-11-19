import {
  DEFAULT_DIALOG_CONFIG,
  DialogConfig,
  DialogRef,
} from '@angular/cdk/dialog';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
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
import { LabErrorHandler } from './error/error-handler';

let closePredicateIndex = 0;
export const APP_DIALOG_CONFIG: DialogConfig = {
  container: Dialog,
  hasBackdrop: true,
  /** Hacky workaround to animate leaving all dialogs */
  closePredicate: (result, _, component): boolean => {
    // Find the dialogRef reference on the component
    const dialogRef = (component as { dialogRef: DialogRef }).dialogRef;
    // If not found, just allow the dialog to close, we can't animate it
    if (dialogRef?.containerInstance == null) {
      if (isDevMode())
        console.warn('Closing dialog without animation', component);
      return true;
    }

    // Animate leaving dialog, return false, return true on the next call
    // (after the animation completes)
    (dialogRef.containerInstance as Dialog).animateClose(result);
    return closePredicateIndex++ % 2 === 1;
  },
};

async function initializeApp(): Promise<unknown> {
  return Promise.all([inject(Translate).load(), loadModule('glpk.all.wasm')]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: DEFAULT_DIALOG_CONFIG, useValue: APP_DIALOG_CONFIG },
    { provide: ErrorHandler, useClass: LabErrorHandler },
    provideAppInitializer(() => initializeApp()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
