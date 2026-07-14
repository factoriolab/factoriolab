import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { rational } from '~/rational/rational';
import { ItemId } from '~/tests/item-id';
import { TestModule } from '~/tests/test-module';

import { Settings } from './settings';

describe('Settings', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Settings],
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('miningSpeed', () => {
    it('should return the mining bonus plus 100', () => {
      expect(component['miningSpeed']().eq(rational(140n))).toBeTrue();
    });
  });

  describe('setParams', () => {
    it('should call the router to navigate', () => {
      spyOn(component['router'], 'navigateByUrl');
      component.setParams('v=9');
      expect(component['router'].navigateByUrl).toHaveBeenCalled();
    });
  });

  describe('openTechnologies', () => {
    it('should open the technologies dialog and apply the result', () => {
      spyOn(component['dialog'], 'open').and.returnValue({
        closed: of(undefined),
        componentInstance: { result: () => new Set() },
      } as any);
      spyOn(component['settingsStore'], 'apply');
      component.openTechnologies();
      expect(component['dialog'].open).toHaveBeenCalled();
      expect(component['settingsStore'].apply).toHaveBeenCalledWith({
        researchedTechnologyIds: new Set(),
      });
    });
  });

  describe('addMachine', () => {
    it('should update the set and pass to the store action, then reset the signal', async () => {
      spyOn(component['settingsStore'], 'updateField');
      component.addMachine(ItemId.AssemblingMachine2);
      expect(component['settingsStore'].updateField).toHaveBeenCalledWith(
        'machineRankIds',
        [
          ItemId.ElectricMiningDrill,
          ItemId.ElectricFurnace,
          ItemId.AssemblingMachine3,
          ItemId.AssemblingMachine2,
        ],
        [
          ItemId.ElectricMiningDrill,
          ItemId.ElectricFurnace,
          ItemId.AssemblingMachine3,
        ],
      );

      spyOn(component['addMachineValue'], 'set');
      await TestBed.inject(ApplicationRef).whenStable();
      expect(component['addMachineValue'].set).toHaveBeenCalledWith(null);
    });
  });

  describe('setMachine', () => {
    it('should update the set and pass to the store action', () => {
      spyOn(component['settingsStore'], 'updateField');
      component.changeMachine(0, ItemId.AssemblingMachine2);
      expect(component['settingsStore'].updateField).toHaveBeenCalledWith(
        'machineRankIds',
        [
          ItemId.AssemblingMachine2,
          ItemId.ElectricFurnace,
          ItemId.AssemblingMachine3,
        ],
        [
          ItemId.ElectricMiningDrill,
          ItemId.ElectricFurnace,
          ItemId.AssemblingMachine3,
        ],
      );
    });
  });

  describe('dropMachine', () => {
    it('should reorder machines and pass to the store', () => {
      spyOn(component['settingsStore'], 'updateField');
      component.dropMachine({ previousIndex: 0, currentIndex: 1 } as any);
      expect(component['settingsStore'].updateField).toHaveBeenCalledWith(
        'machineRankIds',
        [
          ItemId.ElectricFurnace,
          ItemId.ElectricMiningDrill,
          ItemId.AssemblingMachine3,
        ],
        [
          ItemId.ElectricMiningDrill,
          ItemId.ElectricFurnace,
          ItemId.AssemblingMachine3,
        ],
      );
    });
  });

  describe('changeModules', () => {
    it('should dehydrate the modules', () => {
      spyOn(component['hydration'], 'dehydrateModules');
      spyOn(component['machinesStore'], 'updateRecord');
      component.changeModules(ItemId.AssemblingMachine2, []);
      expect(component['hydration'].dehydrateModules).toHaveBeenCalled();
      expect(component['machinesStore'].updateRecord).toHaveBeenCalled();
    });
  });

  describe('changeBeacons', () => {
    it('should dehydrate the beacons', () => {
      spyOn(component['hydration'], 'dehydrateBeacons');
      spyOn(component['machinesStore'], 'updateRecord');
      component.changeBeacons(ItemId.AssemblingMachine2, []);
      expect(component['hydration'].dehydrateBeacons).toHaveBeenCalled();
      expect(component['machinesStore'].updateRecord).toHaveBeenCalled();
    });
  });

  describe('removeMachine', () => {
    it('should update the set and pass to the store action', () => {
      spyOn(component['settingsStore'], 'updateField');
      component.removeMachine(ItemId.AssemblingMachine3);
      expect(component['settingsStore'].updateField).toHaveBeenCalledWith(
        'machineRankIds',
        [ItemId.ElectricMiningDrill, ItemId.ElectricFurnace],
        [
          ItemId.ElectricMiningDrill,
          ItemId.ElectricFurnace,
          ItemId.AssemblingMachine3,
        ],
      );
    });
  });

  describe('openRecipeProductivity', () => {
    it('should open the RecipeProductivityDialog', () => {
      spyOn(component['dialog'], 'open');
      component.openRecipeProductivity();
      expect(component['dialog'].open).toHaveBeenCalled();
    });
  });
});
