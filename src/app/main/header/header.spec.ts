import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Header],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    setInputs(fixture, {
      preferencesOpen: false,
      settingsOpen: false,
      settingsXlHidden: false,
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('togglePreferences', () => {
    it('should toggle preferences open and closed', () => {
      component.togglePreferences();
      expect(component.preferencesOpen()).toBeTrue();
      component.togglePreferences();
      expect(component.preferencesOpen()).toBeFalse();
    });
  });

  describe('toggleSettings', () => {
    it('should toggle settings open and closed', () => {
      component.toggleSettings();
      expect(component.settingsOpen()).toBeTrue();
      component.toggleSettings();
      expect(component.settingsOpen()).toBeFalse();
    });
  });

  describe('setGame', () => {
    it('should map a game to its default mod id', () => {
      spyOn(component['router'], 'navigate');
      component.setGame('factorio');
      expect(component['router'].navigate).toHaveBeenCalledWith(['spa']);
    });
  });
});
