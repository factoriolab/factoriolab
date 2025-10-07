import {
  DEFAULT_DIALOG_CONFIG,
  DialogConfig,
  DialogRef,
} from '@angular/cdk/dialog';
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
