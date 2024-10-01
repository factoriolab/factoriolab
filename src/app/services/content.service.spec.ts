import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Confirmation } from 'primeng/api';

import { TestModule } from '~/tests';

import { ContentService } from './content.service';

describe('ContentService', () => {
  let service: ContentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(ContentService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('windowScrollY', () => {
    it('should return the value from the window', () => {
      expect(service.windowScrollY()).toEqual(window.scrollY);
    });
  });

  describe('windowInnerWidth', () => {
    it('should return the value from the window', () => {
      expect(service.windowInnerWidth()).toEqual(window.innerWidth);
    });
  });

  describe('confirm', () => {
    it('should add a confirmation to the subject', () => {
      let confirm: Confirmation | undefined;
      service.showConfirm$.subscribe((c) => (confirm = c));
      const value: Confirmation = {};
      service.confirm(value);
      expect(confirm).toEqual(value);
    });
  });

  describe('toggleSettings', () => {
    it('should switch the settings active state', () => {
      const value = service.settingsActive();
      service.toggleSettings();
      expect(service.settingsActive()).toEqual(!value);
    });
  });

  describe('toggleSettingsXl', () => {
    it('should switch the settings (xl) hidden state', () => {
      const value = service.settingsXlHidden();
      service.toggleSettingsXl();
      expect(service.settingsXlHidden()).toEqual(!value);
    });
  });

  describe('version$', () => {
    it('should return a version string to use in the app', () => {
      let version: string | undefined;
      service.version$.subscribe((v) => (version = v));
      http.expectOne('assets/release.json').flush({ version: '0.0.0' });
      expect(version).toEqual('FactorioLab 0.0.0 (test)');
    });
  });
});
