import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, ItemId, RecipeId, TestModule } from 'src/tests';
import { RateType } from '~/models';
import { LabState, Producers, Products, Settings } from '~/store';
import { WizardComponent, WizardState } from './wizard.component';
import { WizardModule } from './wizard.module';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, WizardModule],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selectId', () => {
    it('should set the id and state', () => {
      component.selectId(ItemId.IronPlate, WizardState.ProductType);
      expect(component.id).toEqual(ItemId.IronPlate);
      expect(component.state).toEqual(WizardState.ProductType);
    });
  });

  describe('openViaState', () => {
    it('should add a product to determine via steps', () => {
      spyOn(component, 'createProduct');
      component.openViaState();
      expect(component.createProduct).toHaveBeenCalledWith(
        '',
        '1',
        RateType.Items
      );
      expect(component.state).toEqual(WizardState.ProductVia);
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.valPrev('setDisplayRate', Settings.SetDisplayRateAction);
    dispatch.spy.calls.reset();
    component.createProduct(
      ItemId.IronPlate,
      '1',
      RateType.Items,
      ItemId.IronOre
    );
    expect(dispatch.mockStore.dispatch).toHaveBeenCalledWith(
      new Products.CreateAction({
        id: '0',
        itemId: ItemId.IronPlate,
        rate: '1',
        rateType: RateType.Items,
        viaId: ItemId.IronOre,
      })
    );
    dispatch.spy.calls.reset();
    component.createProducer(RecipeId.IronPlate, '1');
    expect(dispatch.mockStore.dispatch).toHaveBeenCalledWith(
      new Producers.CreateAction({
        id: '0',
        recipeId: ItemId.IronPlate,
        count: '1',
      })
    );
  });
});
