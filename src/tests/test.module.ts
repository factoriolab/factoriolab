import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';

import { routes } from '~/app.routes';
import { RatePipe } from '~/routes/main/routes/list/pipes/rate.pipe';
import { MainSharedModule } from '~/routes/main/shared/main-shared.module';
import { AppSharedModule } from '~/shared';
import { initialState } from './state';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientTestingModule,
    RouterTestingModule.withRoutes(routes),
    NoopAnimationsModule,
    TranslateModule.forRoot(),
    AppSharedModule,
    MainSharedModule,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AppSharedModule,
    MainSharedModule,
  ],
  providers: [provideMockStore({ initialState }), RatePipe],
})
export class TestModule {}
