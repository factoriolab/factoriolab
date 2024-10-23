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
});
