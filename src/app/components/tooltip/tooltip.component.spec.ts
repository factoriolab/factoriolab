import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemId, setInputs, TestModule } from '~/tests';

import { TooltipComponent } from './tooltip.component';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule, TooltipComponent],
    });
    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    setInputs(fixture, { id: ItemId.IronPlate });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('recipe', () => {
    it('should return undefined for invalid types', () => {
      setInputs(fixture, { type: 'beacon' });
      expect(component.recipe()).toBeUndefined();
    });

    it('should not return a recipe if multiple are available', () => {
      setInputs(fixture, { id: 'petroleum-gas' });
      expect(component.recipe()).toBeUndefined();
    });
  });

  describe('unlockedRecipes', () => {
    it('should return a list of unlocked recipes', () => {
      setInputs(fixture, { id: 'automation', type: 'technology' });
      expect(component.unlockedRecipes()?.length).toEqual(2);
    });

    it('should return undefined for non-techs', () => {
      expect(component.unlockedRecipes()).toBeUndefined();
    });

    it('should return undefined if no recipes are unlocked', () => {
      setInputs(fixture, { id: 'steel-axe', type: 'technology' });
      expect(component.unlockedRecipes()).toBeUndefined();
    });
  });
});
