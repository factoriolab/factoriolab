import { DEFAULT_DIALOG_CONFIG, DialogConfig } from '@angular/cdk/dialog';
import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  isDevMode,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  withRouterConfig,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { loadModule } from 'glpk-ts';

import { routes } from './app.routes';
import { DialogComponent } from './components/dialog/dialog.component';
import { ErrorService } from './services/error.service';
// import { ThemeService } from './services/theme.service';
import { DEFAULT_LANGUAGE } from './services/translate.service';

export const APP_DIALOG_CONFIG: DialogConfig = {
  container: DialogComponent,
  hasBackdrop: true,
};

async function initializeApp(): Promise<unknown> {
  // Load glpk-wasm
  return loadModule('glpk-wasm/glpk.all.wasm');
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: DEFAULT_LANGUAGE, useValue: 'en' },
    {
      provide: DEFAULT_DIALOG_CONFIG,
      useValue: APP_DIALOG_CONFIG,
    },
    { provide: ErrorHandler, useClass: ErrorService },
    provideAppInitializer(initializeApp),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
