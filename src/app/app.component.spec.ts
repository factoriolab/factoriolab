import {
  TestBed,
  async,
  ComponentFixture,
  tick,
  fakeAsync,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';

import { Id } from './models';
import { RouterService } from './services/router.service';
import { State, reducers, metaReducers } from './store';
import { getDataset, DatasetState } from './store/dataset';
import * as Products from './store/products';
import { TestUtility } from './utilities/test';
import { HeaderComponent } from './components/header/header.component';
import { IconComponent } from './components/icon/icon.component';
import { SettingsContainerComponent } from './components/settings-container/settings-container.component';
import { SettingsComponent } from './components/settings-container/settings/settings.component';
import { ProductsContainerComponent } from './components/products-container/products-container.component';
import { ProductsComponent } from './components/products-container/products/products.component';
import { StepsContainerComponent } from './components/steps-container/steps-container.component';
import { StepsComponent } from './components/steps-container/steps/steps.component';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: Store<State>;
  let router: RouterService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
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
        StepsContainerComponent,
        StepsComponent,
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
  }));

  it('should create the app', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load the dataset', fakeAsync(() => {
    let dataset: DatasetState;
    store.select(getDataset).subscribe((d) => (dataset = d));
    tick();
    expect(dataset.itemIds.length).toBeGreaterThan(0);
  }));

  it('should update the url', () => {
    spyOn(router, 'updateUrl');
    fixture.detectChanges();
    expect(router.updateUrl).toHaveBeenCalled();
  });

  it('should add a product', fakeAsync(() => {
    let ids: number[];
    store.select(Products.getIds).subscribe((i) => (ids = i));
    tick();
    expect(ids.length).toBeGreaterThan(0);
  }));

  it('should not add a product if location includes a hash', () => {
    location.hash = 'test';
    spyOn(store, 'dispatch');
    TestBed.createComponent(AppComponent);
    expect(store.dispatch).not.toHaveBeenCalledWith(new Products.AddAction());
    location.hash = '';
  });

  it('should toggle settings open when clicked', () => {
    component.settingsOpen = false;
    fixture.detectChanges();
    TestUtility.clickId(fixture, Id.HeaderSettings);
    expect(component.settingsOpen).toBe(true);
  });

  it('should toggle settings open when clicked', () => {
    component.settingsOpen = false;
    fixture.detectChanges();
    TestUtility.clickId(fixture, Id.HeaderSettings);
    expect(component.settingsOpen).toBe(true);
  });

  it('should toggle settings closed when clicked away', () => {
    component.settingsOpen = true;
    fixture.detectChanges();
    TestUtility.clickId(fixture, Id.HeaderIcon);
    expect(component.settingsOpen).toBe(false);
  });
});
