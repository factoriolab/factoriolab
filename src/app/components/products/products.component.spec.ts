import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';

import { Mocks, ItemId, initialState } from 'src/tests';
import {
  IconComponent,
  InputComponent,
  PickerComponent,
  OptionsComponent,
} from '~/components';
import { ValidateNumberDirective } from '~/directives';
import { RateType } from '~/models';
import { ProductsComponent } from './products.component';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        IconComponent,
        InputComponent,
        OptionsComponent,
        PickerComponent,
        ValidateNumberDirective,
        ProductsComponent,
      ],
      imports: [FormsModule],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changeItem', () => {
    it('should edit a product item', () => {
      spyOn(component, 'setItem');
      component.changeItem(Mocks.Product1, ItemId.Coal, Mocks.AdjustedData);
      expect(component.setItem).toHaveBeenCalledWith(
        Mocks.Product1.id,
        ItemId.Coal
      );
    });

    it('should reset the rate type when changing a product that has no simple recipe', () => {
      spyOn(component, 'setRateType');
      spyOn(component, 'setItem');
      component.changeItem(
        Mocks.Product4,
        ItemId.PetroleumGas,
        Mocks.AdjustedData
      );
      expect(component.setRateType).toHaveBeenCalledWith(
        Mocks.Product4.id,
        RateType.Items
      );
      expect(component.setItem).toHaveBeenCalledWith(
        Mocks.Product4.id,
        ItemId.PetroleumGas
      );
    });
  });
});
