import { STANDARD_DROPDOWN_BELOW_POSITIONS } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY } from 'rxjs';

import { ItemId } from '~/tests/item-id';
import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';

import { TOOLTIP_DATA } from './tooltip-data';
import { TooltipOverlay } from './tooltip-overlay';

describe('TooltipOverlay', () => {
  let component: TooltipOverlay;
  let fixture: ComponentFixture<TooltipOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, TooltipOverlay],
      providers: [
        {
          provide: TOOLTIP_DATA,
          useValue: {
            value: ItemId.ElectronicCircuit,
            type: 'item',
            defaultPosition: STANDARD_DROPDOWN_BELOW_POSITIONS[0],
            positionChanges: EMPTY,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipOverlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('recipeId', () => {
    it('should get a recipe to show for an item', () => {
      expect(component['recipeId']()).toEqual(RecipeId.ElectronicCircuit);
    });
  });
});
