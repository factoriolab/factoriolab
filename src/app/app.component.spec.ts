import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';

import { TestUtility, ElementId, Mocks } from 'src/tests';
import { SETTINGS_KEY, Theme } from './models';
import { RouterService } from './services/router.service';
import { State, reducers, metaReducers } from './store';
import { AddAction } from './store/products';
import * as Settings from './store/settings';
import {
  HeaderComponent,
  IconComponent,
  SettingsContainerComponent,
  SettingsComponent,
  ProductsContainerComponent,
  ProductsComponent,
  ListContainerComponent,
  ListComponent,
} from './components';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: Store<State>;
  let router: RouterService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        FormsModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
      declarations: [
        IconComponent,
        HeaderComponent,
        SettingsContainerComponent,
        SettingsComponent,
        ProductsContainerComponent,
        ProductsComponent,
        ListContainerComponent,
        ListComponent,
        AppComponent,
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
        router = TestBed.inject(RouterService);
      });
  });

  afterEach(() => {
    localStorage.removeItem(SETTINGS_KEY);
  });

  it('should create the app', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should update the url', () => {
    spyOn(router, 'updateUrl');
    fixture.detectChanges();
    store.dispatch(new AddAction(Mocks.Base.items[0].id));
    fixture.detectChanges();
    expect(router.updateUrl).toHaveBeenCalled();
  });

  it('should update theme when theme changed', () => {
    store.dispatch(new Settings.SetThemeAction(Theme.LightMode));
    fixture.detectChanges();
    expect(document.body.className).toBe(Theme.LightMode);
  });

  describe('toggleSettings', () => {
    it('should toggle settings open when clicked', () => {
      component.showSettings = false;
      fixture.detectChanges();
      TestUtility.clickId(fixture, ElementId.HeaderSettings);
      expect(component.showSettings).toBe(true);
    });
  });

  describe('showHeader', () => {
    it('should show the header if it is hidden', () => {
      store.dispatch(new Settings.HideHeaderAction());
      fixture.detectChanges();
      spyOn(store, 'dispatch');
      TestUtility.clickId(fixture, ElementId.AppShowHeader);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Settings.ShowHeaderAction()
      );
    });
  });

  describe('hideHeader', () => {
    it('should hide the header if it is shown', () => {
      store.dispatch(new Settings.ShowHeaderAction());
      fixture.detectChanges();
      spyOn(store, 'dispatch');
      TestUtility.clickId(fixture, ElementId.HeaderMenuToggle);
      fixture.detectChanges();
      TestUtility.clickId(fixture, ElementId.HeaderHide);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Settings.HideHeaderAction()
      );
    });
  });
});
