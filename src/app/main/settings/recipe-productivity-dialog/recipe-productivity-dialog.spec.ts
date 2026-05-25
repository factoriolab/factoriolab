import { ComponentFixture, TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { Mocks } from '~/tests/mocks/mocks';
import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';

import { RecipeProductivityDialog } from './recipe-productivity-dialog';

describe('RecipeProductivityDialog', () => {
  let component: RecipeProductivityDialog;
  let fixture: ComponentFixture<RecipeProductivityDialog>;
  let mocks: Mocks;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, RecipeProductivityDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeProductivityDialog);
    mocks = TestBed.inject(Mocks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect({}).toBeTruthy();
    expect(component).toBeTruthy();
  });

  describe('editValue', () => {
    it('should determine the initial state', () => {
      const data = mocks.getDataset();
      const testTechId = data.technologyIds[0];
      data.prodUpgradeTechIds = [testTechId];
      data.technologyRecord[testTechId].recipeProductivity = [
        { id: RecipeId.AdvancedCircuit, value: rational(10n) },
      ];
      spyOn<any>(component, 'data').and.returnValue(data);
      const result = component['editValue']();
      expect(result).toEqual({ [testTechId]: rational.zero });
    });

    it('should skip if a tech recipe productivity entry is not matched', () => {
      const data = mocks.getDataset();
      const testTechId = data.technologyIds[0];
      data.prodUpgradeTechIds = [testTechId];
      spyOn<any>(component, 'data').and.returnValue(data);
      const result = component['editValue']();
      expect(result).toEqual({});
    });
  });

  describe('updateValue', () => {
    it('should update the edit value for the passed techId', () => {
      component.updateValue('id', rational(10n));
      expect(component['editValue']()['id']).toEqual(rational(10n));
    });
  });

  describe('save', () => {
    it('should update the recipesStore and close the dialog', () => {
      const data = mocks.getDataset();
      const testTechId = data.technologyIds[0];
      data.prodUpgradeTechIds = [testTechId];
      data.technologyRecord[testTechId].recipeProductivity = [
        { id: RecipeId.AdvancedCircuit, value: rational(10n) },
      ];
      spyOn<any>(component, 'data').and.returnValue(data);
      component.updateValue(testTechId, rational(10n));
      spyOn(component['recipesStore'], 'updateRecordField');
      spyOn(component['dialogRef'], 'close');
      component.save();
      expect(component['recipesStore'].updateRecordField).toHaveBeenCalledWith(
        RecipeId.AdvancedCircuit,
        'productivity',
        rational(10n),
        undefined,
      );
      expect(component['dialogRef'].close).toHaveBeenCalled();
    });
  });
});
