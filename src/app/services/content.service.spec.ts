import { TestBed } from '@angular/core/testing';

import { TestModule } from 'src/tests';
import { ContentService } from './content.service';

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(ContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('windowInnerWidth', () => {
    it('should return the value from the window', () => {
      expect(service.windowInnerWidth()).toEqual(window.innerWidth);
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
