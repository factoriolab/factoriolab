import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { provideRouter } from '@angular/router';

@NgModule({
  providers: [
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([]),
  ],
})
export class TestModule {}
