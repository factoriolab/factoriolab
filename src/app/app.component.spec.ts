import { TestBed, async } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';

import { reducers, metaReducers } from './store';
import { HeaderComponent } from './components/header/header.component';
import { IconComponent } from './components/icon/icon.component';
import { ProductsContainerComponent } from './components/products-container/products-container.component';
import { ProductsComponent } from './components/products-container/products/products.component';
import { StepsContainerComponent } from './components/steps-container/steps-container.component';
import { StepsComponent } from './components/steps-container/steps/steps.component';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot(reducers, { metaReducers })],
      declarations: [
        IconComponent,
        HeaderComponent,
        ProductsContainerComponent,
        ProductsComponent,
        StepsContainerComponent,
        StepsComponent,
        AppComponent
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
