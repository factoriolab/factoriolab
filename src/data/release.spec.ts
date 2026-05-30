import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Release } from './release';

describe('Release', () => {
  let service: Release;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Release);
    http = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('version', () => {
    it('should handle no release data', () => {
      expect(service.version()).toEqual('');
    });

    it('should pull the version from the config response', async () => {
      TestBed.tick();
      http.expectOne('release.json').flush({ version: '0.0.0' });
      await TestBed.inject(ApplicationRef).whenStable();
      expect(service.version()).toEqual('FactorioLab 0.0.0');
    });

    it('should handle no version specified', async () => {
      TestBed.tick();
      http.expectOne('release.json').flush({ version: '' });
      await TestBed.inject(ApplicationRef).whenStable();
      expect(service.version()).toEqual('FactorioLab (dev)');
    });
  });
});
