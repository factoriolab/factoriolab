import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { Game } from '~/models/enum/game';
import { LabState } from '~/store';
import { create } from '~/store/objectives/objectives.actions';
import { setBypassLanding } from '~/store/preferences/preferences.actions';
import { setMod } from '~/store/settings/settings.actions';
import { DispatchTest, ItemId, RecipeId, TestModule } from '~/tests';

import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, LandingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selectItem', () => {
    it('should add an item objective and navigate to the list', () => {
      spyOn(component, 'createObjective');
      spyOn(component.router, 'navigate');
      component.selectItem(ItemId.IronPlate);
      expect(component.createObjective).toHaveBeenCalled();
      expect(component.router.navigate).toHaveBeenCalled();
    });
  });

  describe('selectRecipe', () => {
    it('should add a recipe objective and navigate to the list', () => {
      spyOn(component, 'createObjective');
      spyOn(component.router, 'navigate');
      component.selectRecipe(RecipeId.IronPlate);
      expect(component.createObjective).toHaveBeenCalled();
      expect(component.router.navigate).toHaveBeenCalled();
    });
  });

  describe('setState', () => {
    it('should return if query is falsy', () => {
      spyOn(component.router, 'navigate');
      component.setState('');
      expect(component.router.navigate).not.toHaveBeenCalled();
    });

    it('should call the router to navigate', () => {
      spyOn(component.router, 'navigate');
      component.setState('z=zip');
      expect(component.router.navigate).toHaveBeenCalledWith(['list'], {
        queryParams: { z: 'zip' },
        relativeTo: component.route,
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
    dispatch.props('setMod', setMod);
    dispatch.props('createObjective', create);
    dispatch.props('setBypassLanding', setBypassLanding);
  });
});
