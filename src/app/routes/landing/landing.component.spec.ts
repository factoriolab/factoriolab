import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Game } from '~/models/enum/game';
import { ItemId, RecipeId, TestModule } from '~/tests';

import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, LandingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selectItem', () => {
    it('should add an item objective and navigate to the list', () => {
      spyOn(component.objectivesSvc, 'create');
      spyOn(component.router, 'navigate');
      component.selectItem(ItemId.IronPlate);
      expect(component.objectivesSvc.create).toHaveBeenCalled();
      expect(component.router.navigate).toHaveBeenCalled();
    });
  });

  describe('selectRecipe', () => {
    it('should add a recipe objective and navigate to the list', () => {
      spyOn(component.objectivesSvc, 'create');
      spyOn(component.router, 'navigate');
      component.selectRecipe(RecipeId.IronPlate);
      expect(component.objectivesSvc.create).toHaveBeenCalled();
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
      expect(component.setMod).toHaveBeenCalledWith('spa');
    });
  });

  describe('setMod', () => {
    it('should navigate using the router', () => {
      spyOn(component.router, 'navigate');
      component.setMod('id');
      expect(component.router.navigate).toHaveBeenCalledWith(['id']);
    });
  });
});
