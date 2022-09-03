import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, TestModule } from 'src/tests';
import { AppSharedModule } from '~/app-shared.module';
import { LabState, Products, Settings } from '~/store';
import { ProductsComponent } from './products.component';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductsComponent],
      imports: [AppSharedModule, TestModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.val('removeProduct', Products.RemoveAction);
    dispatch.idVal('setItem', Products.SetItemAction);
    dispatch.idVal('setRate', Products.SetRateAction);
    dispatch.idVal('setRateType', Products.SetRateTypeAction);
    dispatch.idVal('setVia', Products.SetViaAction);
    dispatch.val('addProduct', Products.AddAction);
    dispatch.valPrev('setDisplayRate', Settings.SetDisplayRateAction);
  });
});
