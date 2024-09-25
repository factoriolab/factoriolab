import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemId, RecipeId, TestModule } from '~/tests';

import { WizardComponent } from './wizard.component';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, WizardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selectId', () => {
    it('should set the id and state', () => {
      component.selectId(ItemId.IronPlate, 'item');
      expect(component.id).toEqual(ItemId.IronPlate);
      expect(component.state).toEqual('item');
    });
  });

  describe('createItemObjective', () => {
    it('should add an item objective and navigate to the list', () => {
      spyOn(component.objectivesSvc, 'create');
      spyOn(component.router, 'navigate');
      component.createItemObjective(ItemId.IronPlate);
      expect(component.objectivesSvc.create).toHaveBeenCalled();
      expect(component.router.navigate).toHaveBeenCalled();
    });
  });

  describe('createRecipeObjective', () => {
    it('should add a recipe objective and navigate to the list', () => {
      spyOn(component.objectivesSvc, 'create');
      spyOn(component.router, 'navigate');
      component.createRecipeObjective(RecipeId.IronPlate);
      expect(component.objectivesSvc.create).toHaveBeenCalled();
      expect(component.router.navigate).toHaveBeenCalled();
    });
  });
});
