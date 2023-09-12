import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, ItemId, RecipeId, TestModule } from 'src/tests';
import { Game, ObjectiveUnit } from '~/models';
import { LabState, Objectives, Preferences, Settings } from '~/store';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let router: Router;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, LandingComponent],
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

  describe('selectItem', () => {
    it('should add an item objective and navigate to the list', () => {
      spyOn(component, 'addItemObjective');
      spyOn(router, 'navigate');
      component.selectItem(ItemId.IronPlate);
      expect(component.addItemObjective).toHaveBeenCalledWith(ItemId.IronPlate);
      expect(router.navigate).toHaveBeenCalledWith(['list']);
    });
  });

  describe('selectRecipe', () => {
    it('should add a recipe objective and navigate to the list', () => {
      spyOn(component, 'addRecipeObjective');
      spyOn(router, 'navigate');
      component.selectRecipe(RecipeId.IronPlate);
      expect(component.addRecipeObjective).toHaveBeenCalledWith(
        ItemId.IronPlate,
      );
      expect(router.navigate).toHaveBeenCalledWith(['list']);
    });
  });

  describe('setState', () => {
    it('should call the router to navigate', () => {
      spyOn(router, 'navigate');
      component.setState('z=zip');
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

  describe('addItemObjective', () => {
    it('should use ObjectiveUnit.Items', () => {
      spyOn(component, 'addObjective');
      component.addItemObjective(ItemId.AdvancedCircuit);
      expect(component.addObjective).toHaveBeenCalledWith({
        targetId: ItemId.AdvancedCircuit,
        unit: ObjectiveUnit.Items,
      });
    });
  });

  describe('addRecipeObjective', () => {
    it('should use ObjectiveUnit.Machines', () => {
      spyOn(component, 'addObjective');
      component.addRecipeObjective(RecipeId.AdvancedCircuit);
      expect(component.addObjective).toHaveBeenCalledWith({
        targetId: RecipeId.AdvancedCircuit,
        unit: ObjectiveUnit.Machines,
      });
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.val('setMod', Settings.SetModAction);
    dispatch.val('addObjective', Objectives.AddAction);
    dispatch.val('setBypassLanding', Preferences.SetBypassLandingAction);
  });
});
