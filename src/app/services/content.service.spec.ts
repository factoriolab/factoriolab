import { TestBed } from '@angular/core/testing';
import { Confirmation } from 'primeng/api';
import { ConnectedOverlayScrollHandler, DomHandler } from 'primeng/dom';

import { TestModule } from 'src/tests';
import { ContentService } from './content.service';

describe('ConnectedOverlayScrollHandler', () => {
  it('should include the window in the list of scrollable parents', () => {
    spyOn(DomHandler, 'getScrollableParents').and.returnValue([]);
    const scrollHandler = new ConnectedOverlayScrollHandler({} as any);
    scrollHandler.bindScrollListener();
    expect(scrollHandler.scrollableParents).toEqual([window]);
  });
});

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
