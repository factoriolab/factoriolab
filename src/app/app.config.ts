import {
  DEFAULT_DIALOG_CONFIG,
  DialogConfig,
  DialogRef,
} from '@angular/cdk/dialog';
import { provideHttpClient } from '@angular/common/http';
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
import {
  provideServiceWorker,
  SwRegistrationOptions,
} from '@angular/service-worker';
import { loadModule } from 'glpk-ts';

import { AnimatedCloseDialog, Dialog } from '~/components/dialog/dialog';
import { SIMPLEX_CONFIG } from '~/solver/simplex-config';
import { Translate } from '~/translate/translate';

import { routes } from './app.routes';
import { LabErrorHandler } from './error/error-handler';

let closePredicateIndex = 0;

export const APP_DIALOG_CONFIG = new DialogConfig();
APP_DIALOG_CONFIG.container = Dialog;
APP_DIALOG_CONFIG.hasBackdrop = true;
/** Hacky workaround to animate leaving all dialogs */
APP_DIALOG_CONFIG.closePredicate = (result, _, component): boolean => {
  // Find the dialogRef reference on the component
  const dialogRef = (component as { dialogRef: DialogRef } | undefined)
    ?.dialogRef;
  // If not found, just allow the dialog to close, we can't animate it
  if (dialogRef?.containerInstance == null) {
    if (isDevMode())
      console.warn('Closing dialog without animation', component);
    return true;
  }

  // Animate leaving dialog, return false, return true on the next call
  // (after the animation completes)
  (dialogRef.containerInstance as unknown as AnimatedCloseDialog).animateClose(
    result,
  );
  return closePredicateIndex++ % 2 === 1;
};

async function initializeApp(): Promise<unknown> {
  return Promise.all([inject(Translate).load(), loadModule('glpk.all.wasm')]);
}

class RegistrationOptions extends SwRegistrationOptions {
  constructor(
    public override enabled: boolean,
    public override registrationStrategy: string,
  ) {
    super();
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: DEFAULT_DIALOG_CONFIG, useValue: APP_DIALOG_CONFIG },
    { provide: ErrorHandler, useClass: LabErrorHandler },
    provideAppInitializer(() => initializeApp()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    provideServiceWorker(
      'ngsw-worker.js',
      new RegistrationOptions(!isDevMode(), 'registerWhenStable:30000'),
    ),
    {
      provide: SIMPLEX_CONFIG,
      useFactory: () => (isDevMode() ? {} : { msgLevel: 'off' }),
    },
  ],
};
