import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';

import { initialState } from './state';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientTestingModule,
    RouterTestingModule,
    NoopAnimationsModule,
    TranslateModule.forRoot(),
  ],
  exports: [FormsModule, ReactiveFormsModule, TranslateModule],
  providers: [provideMockStore({ initialState })],
})
export class TestModule {}
