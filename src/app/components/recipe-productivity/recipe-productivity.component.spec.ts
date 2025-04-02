import { ComponentFixture, TestBed } from '@angular/core/testing';

import { rational } from '~/models/rational';
import { ItemId, Mocks, RecipeId, TestModule } from '~/tests';

import { RecipeProductivityComponent } from './recipe-productivity.component';

describe('RecipeProductivityComponent', () => {
  let component: RecipeProductivityComponent;
  let fixture: ComponentFixture<RecipeProductivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, RecipeProductivityComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeProductivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('modified', () => {
    it('should determine whether the value matches the initial state', () => {
      component.reset();
      expect(component.modified).toBeFalse();
      component.editValue[RecipeId.SteelPlate] = rational(10n);
      expect(component.modified).toBeTrue();
    });
  });

  describe('open', () => {
    it('should set up the editValue and show the dialog', () => {
      const data = Mocks.getDataset();
      data.prodUpgradeTechs.push(ItemId.ArtilleryShellRange);
      data.prodUpgrades[ItemId.ArtilleryShellRange] = [RecipeId.SteelPlate];
      spyOn(component, 'data').and.returnValue(data);
      spyOn(component, 'show');
      component.editValue = null as any;
      component.open();
      expect(component.editValue).toEqual({
        [ItemId.ArtilleryShellRange]: rational.zero,
      });
      expect(component.show).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should set the value back to the initial state', () => {
      const data = Mocks.getDataset();
      data.prodUpgradeTechs.push(ItemId.ArtilleryShellRange);
      data.prodUpgrades[ItemId.ArtilleryShellRange] = [RecipeId.SteelPlate];
      spyOn(component, 'data').and.returnValue(data);
      component.editValue = null as any;
      component.reset();
      expect(component.editValue).toEqual({
        [ItemId.ArtilleryShellRange]: rational.zero,
      });
    });
  });

  describe('save', () => {
    it('should dispatch the action', () => {
      const data = Mocks.getDataset();
      data.prodUpgradeTechs.push(ItemId.ArtilleryShellRange);
      data.prodUpgrades[ItemId.ArtilleryShellRange] = [RecipeId.SteelPlate];
      spyOn(component, 'data').and.returnValue(data);
      spyOn(component.recipesSvc, 'updateEntityField');
      component.save();
      expect(component.recipesSvc.updateEntityField).toHaveBeenCalledWith(
        RecipeId.SteelPlate,
        'productivity',
        undefined,
        rational.zero,
      );
    });
  });
});
