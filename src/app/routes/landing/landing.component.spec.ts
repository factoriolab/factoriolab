import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, ItemId, Mocks, RecipeId, TestModule } from 'src/tests';
import { Game } from '~/models';
import { LabState, Preferences, Producers, Products, Settings } from '~/store';
import { LandingComponent } from './landing.component';
import { LandingModule } from './landing.module';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let router: Router;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, LandingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    router = TestBed.inject(Router);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selectProduct', () => {
    it('should add a product and navigate to the list', () => {
      spyOn(component, 'addProduct');
      spyOn(router, 'navigate');
      component.selectProduct(ItemId.IronPlate);
      expect(component.addItem).toHaveBeenCalledWith(ItemId.IronPlate);
      expect(router.navigate).toHaveBeenCalledWith(['list']);
    });
  });

  describe('selectProducer', () => {
    it('should add a producer and navigate to the list', () => {
      spyOn(component, 'addProducer');
      spyOn(router, 'navigate');
      component.selectProducer(RecipeId.IronPlate);
      expect(component.addProducer).toHaveBeenCalledWith(ItemId.IronPlate);
      expect(router.navigate).toHaveBeenCalledWith(['list']);
    });
  });

  describe('setState', () => {
    it('should call the router to navigate', () => {
      spyOn(router, 'navigate');
      component.setState('name', Mocks.PreferencesState);
      expect(router.navigate).toHaveBeenCalledWith(['list'], {
        queryParams: { z: 'zip' },
      });
    });
  });

  describe('setGame', () => {
    it('should map a game to its default mod id', () => {
      spyOn(component, 'setMod');
      component.setGame(Game.Factorio);
      expect(component.setMod).toHaveBeenCalledWith('1.1');
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.val('setMod', Settings.SetModAction);
    dispatch.val('addProduct', Products.AddAction);
    dispatch.val('addProducer', Producers.AddAction);
    dispatch.val('setBypassLanding', Preferences.SetBypassLandingAction);
  });
});
