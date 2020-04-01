import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { StoreModule, Store } from '@ngrx/store';

import * as data from 'src/assets/0-18.json';
import { Id } from './models';
import { State, reducers, metaReducers } from './store';
import { LoadDatasetAction } from './store/dataset';
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, StoreModule.forRoot(reducers, { metaReducers })],
      declarations: [
        IconComponent,
        HeaderComponent,
        SettingsContainerComponent,
        SettingsComponent,
        ProductsContainerComponent,
        ProductsComponent,
        StepsContainerComponent,
        StepsComponent,
        AppComponent
      ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
      });
  }));

  it('should create the app', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load the dataset', () => {
    spyOn(store, 'dispatch');
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledWith(
      new LoadDatasetAction((data as any).default)
    );
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
