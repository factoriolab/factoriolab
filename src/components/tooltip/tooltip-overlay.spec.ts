import {
  ConnectedOverlayPositionChange,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY, Subject } from 'rxjs';

import { rational } from '~/rational/rational';
import { ItemId } from '~/tests/item-id';
import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';

import { TOOLTIP_DATA } from './tooltip-data';
import { TooltipOverlay } from './tooltip-overlay';

describe('TooltipOverlay', () => {
  let component: TooltipOverlay;
  let fixture: ComponentFixture<TooltipOverlay>;
  let positionChanges: Subject<ConnectedOverlayPositionChange>;

  beforeEach(async () => {
    positionChanges = new Subject<ConnectedOverlayPositionChange>();
    await TestBed.configureTestingModule({
      imports: [TestModule, TooltipOverlay],
      providers: [
        {
          provide: TOOLTIP_DATA,
          useValue: {
            value: ItemId.ElectronicCircuit,
            type: 'item',
            defaultPosition: STANDARD_DROPDOWN_BELOW_POSITIONS[0],
            positionChanges,
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

  describe('constructor', () => {
    it('should subscribe to position changes', () => {
      spyOn(component['position'], 'set');
      positionChanges.next({ connectionPair: {} } as any);
      expect(component['position'].set).toHaveBeenCalled();
    });
  });
});

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
            value: RecipeId.ElectronicCircuit,
            type: 'recipe',
            defaultPosition: STANDARD_DROPDOWN_BELOW_POSITIONS[0],
            positionChanges: EMPTY,
            adjustedRecipe: {
              effects: {
                consumption: rational.one,
                pollution: rational.one,
                productivity: rational.one,
                quality: rational.one,
                speed: rational.one,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipOverlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('recipeId', () => {
    it('should return undefined where not relevant', () => {
      expect(component['recipeId']()).toBeUndefined();
    });
  });
});

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
            value: ItemId.PetroleumGas,
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

  describe('recipeId', () => {
    it('should return undefined if a single recipe match is not found', () => {
      expect(component['recipeId']()).toBeUndefined();
    });
  });
});
