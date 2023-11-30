import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';

import { AppSharedModule } from '~/app-shared.module';
import { MainSharedModule } from '~/routes/main/main-shared.module';
import { initialState } from './state';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientTestingModule,
    RouterTestingModule,
    NoopAnimationsModule,
    TranslateModule.forRoot(),
    AppSharedModule,
    MainSharedModule,
  ],
  exports: [FormsModule, TranslateModule, AppSharedModule, MainSharedModule],
  providers: [provideMockStore({ initialState })],
})
export class TestModule {}
