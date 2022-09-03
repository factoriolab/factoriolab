import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Confirmation } from 'primeng/api';

import { TestModule } from 'src/tests';
import { ContentService } from './content.service';

describe('ContentService', () => {
  let service: ContentService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(ContentService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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
      const value = service.settingsActive$.value;
      service.toggleSettings();
      expect(service.settingsActive$.value).toEqual(!value);
    });
  });

  describe('toggleSettingsXl', () => {
    it('should switch the settings (xl) hidden state', () => {
      const value = service.settingsXlHidden$.value;
      service.toggleSettingsXl();
      expect(service.settingsXlHidden$.value).toEqual(!value);
    });
  });
});
