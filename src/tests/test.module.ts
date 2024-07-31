import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';

import { AppSharedModule } from '~/app-shared.module';
import { MainSharedModule } from '~/routes/main/main-shared.module';
import { initialState } from './state';

@NgModule({
  exports: [FormsModule, AppSharedModule, MainSharedModule],
  imports: [
    FormsModule,
    NoopAnimationsModule,
    AppSharedModule,
    MainSharedModule,
  ],
  providers: [
    provideMockStore({ initialState }),
    provideHttpClient(withInterceptorsFromDi()),
    provideHttpClientTesting(),
    provideRouter([]),
  ],
})
export class TestModule {}
