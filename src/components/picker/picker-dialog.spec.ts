import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ApplicationRef, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModData } from '~/data/schema/mod-data';
import { qualityId, QualityJson } from '~/data/schema/quality';
import { SettingsStore } from '~/state/settings/settings-store';
import { CategoryId } from '~/tests/category-id';
import { ItemId } from '~/tests/item-id';
import { mockModData } from '~/tests/mocks/data';
import { Mocks } from '~/tests/mocks/mocks';
import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';

import { PickerData } from './picker-data';
import { PickerDialog } from './picker-dialog';

describe('PickerDialog', () => {
  let component: PickerDialog;
  let fixture: ComponentFixture<PickerDialog>;
  let mocks: Mocks;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, PickerDialog],
      providers: [
        {
          provide: DIALOG_DATA,
          useFactory: (): PickerData => {
            const settingsStore = inject(SettingsStore);
            return { type: 'item', allIds: settingsStore.dataset().itemIds };
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PickerDialog);
    mocks = TestBed.inject(Mocks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('allSelected', () => {
    it('should determine the checkbox state for the select all', () => {
      expect(component['allSelected']()).toBeTrue();
      component['selection'].set(new Set(component['dialogData'].allIds));
      expect(component['allSelected']()).toBeFalse();
      component['selection'].set(new Set(['id']));
      expect(component['allSelected']()).toBeUndefined();
    });
  });

  describe('recyclingSet', () => {
    it('should collect the set of recycling recipes', () => {
      const data = mocks.getDataset();
      data.recipeRecord[RecipeId.ElectronicCircuit].flags.add('recycling');
      spyOn<any>(component, 'data').and.returnValue(data);
      component['dialogData'].type = 'recipe';
      component['dialogData'].allIds = data.recipeIds;
      (component as any).multi = true;
      expect(component['recyclingSet']()).toHaveSize(1);
    });

    it('should return an empty set if not configured for recipe multiselect', () => {
      expect(component['recyclingSet']()).toEqual(new Set());
    });
  });

  describe('allRecyclingSelected', () => {
    it('should determine whether all recycling recipes are selected', () => {
      const data = mocks.getDataset();
      data.recipeRecord[RecipeId.ElectronicCircuit].flags.add('recycling');
      data.recipeRecord[RecipeId.AdvancedCircuit].flags.add('recycling');
      spyOn<any>(component, 'data').and.returnValue(data);
      component['dialogData'].type = 'recipe';
      component['dialogData'].allIds = data.recipeIds;
      (component as any).multi = true;
      expect(component['allRecyclingSelected']()).toBeTrue();
      component['selection'].set(
        new Set([RecipeId.ElectronicCircuit, RecipeId.AdvancedCircuit]),
      );
      expect(component['allRecyclingSelected']()).toBeFalse();
      component['selection'].set(new Set([RecipeId.ElectronicCircuit]));
      expect(component['allRecyclingSelected']()).toBeUndefined();
    });
  });

  describe('isDefault', () => {
    it('determines whether the current selection matches the default', () => {
      expect(component['isDefault']()).toBeTrue();
    });
  });

  describe('categoryRows', () => {
    it('should filter by abnormal quality', () => {
      const data = mocks.getDataset();
      data.qualityRecord['uncommon'] = {
        id: 'uncommon',
        name: 'Uncommon',
        level: 1,
      };
      spyOn<any>(component, 'data').and.returnValue(data);
      component['selectedQuality'].set('uncommon');
      expect(component['categoryRows']()).toHaveSize(0);
    });

    it('should filter by normal quality', () => {
      const data = mocks.getDataset();
      data.qualityRecord['normal'] = { id: 'normal', name: 'Normal', level: 0 };
      spyOn<any>(component, 'data').and.returnValue(data);
      component['selectedQuality'].set('normal');
      expect(component['categoryRows']()).toHaveSize(6);
    });

    it('should filter based on text', () => {
      component['filter'].set('circuit');
      expect(component['categoryRows']()).toHaveSize(2);
    });
  });

  describe('selectedQuality', () => {
    const modData: ModData = {
      ...mockModData,
      ...{
        qualities: [
          { id: '0', icon: ItemId.Coal, name: '0', level: 0 },
          { id: '1', icon: ItemId.Coal, name: '1', level: 1 },
          { id: '2', icon: ItemId.Coal, name: '2', level: 2 },
        ],
      },
    };

    it('should preserve the last value used in this session', async () => {
      PickerDialog['lastQuality'] = '2';
      component['settingsStore']['modDataResource'].set(modData);
      await TestBed.inject(ApplicationRef).whenStable();
      expect(component['selectedQuality']()).toEqual('2');
    });

    it('should preserve the last value used in this instance', async () => {
      component['selectedQuality'].set('2');
      component['settingsStore']['modDataResource'].set(modData);
      await TestBed.inject(ApplicationRef).whenStable();
      expect(component['selectedQuality']()).toEqual('2');
    });
  });

  describe('selectedCategory', () => {
    it('should preserve the last value used in this instance', () => {
      component['selectedCategory'].set('combat');
      component['filter'].set('pistol');
      expect(component['selectedCategory']()).toEqual('combat');
    });
  });

  describe('selectAll', () => {
    it('should select and deselect allIds', () => {
      component.selectAll(false);
      expect(component['selection']().size).toBeGreaterThan(0);
      component.selectAll(true);
      expect(component['selection']().size).toEqual(0);
    });
  });

  describe('selectAllRecycling', () => {
    it('should select and deselect all recycling ids', () => {
      spyOn<any>(component, 'recyclingSet').and.returnValue(new Set(['id']));
      component.selectAllRecycling(false);
      expect(component['selection']().size).toEqual(1);
      component.selectAllRecycling(true);
      expect(component['selection']().size).toEqual(0);
    });
  });

  describe('selectId', () => {
    it('should select and deselect in multi mode', () => {
      (component as any).multi = true;
      component.selectId('id');
      expect(component['selection']().size).toEqual(1);
      component.selectId('id');
      expect(component['selection']().size).toEqual(0);
    });

    it('should close the dialog in single selection mode', () => {
      spyOn(component['dialogRef'], 'close');
      component.selectId('id');
      expect(component['dialogRef'].close).toHaveBeenCalledWith('id');
    });
  });

  describe('reset', () => {
    it('should reset to the default selection', () => {
      spyOn(component['selection'], 'set');
      component.reset();
      expect(component['selection'].set).toHaveBeenCalledWith(new Set());
    });
  });
});

describe('PickerDialog', () => {
  let component: PickerDialog;
  let fixture: ComponentFixture<PickerDialog>;

  beforeEach(async () => {
    const qualities: QualityJson[] = [
      { id: '1', icon: ItemId.Coal, name: '1', level: 1 },
    ];
    const modData: ModData = {
      ...mockModData,
      ...{
        qualities,
      },
    };

    await TestBed.configureTestingModule({
      imports: [TestModule, PickerDialog],
      providers: [
        {
          provide: DIALOG_DATA,
          useFactory: (): PickerData => {
            const settingsStore = inject(SettingsStore);
            return {
              type: 'item',
              allIds: settingsStore.dataset().itemIds,
              selection: new Set([qualityId(ItemId.Coal, qualities[0])]),
            };
          },
        },
      ],
    }).compileComponents();

    const settingsStore = TestBed.inject(SettingsStore);
    settingsStore['modDataResource'].set(modData);
    fixture = TestBed.createComponent(PickerDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should parse a selection set and apply selected category and quality', () => {
    expect(component['selectedCategory']()).toEqual(CategoryId.Intermediate);
    expect(component['selectedQuality']()).toEqual('1');
  });
});

describe('PickerDialog', () => {
  let component: PickerDialog;
  let fixture: ComponentFixture<PickerDialog>;

  beforeEach(async () => {
    const qualities: QualityJson[] = [
      { id: '1', icon: ItemId.Coal, name: '1', level: 1 },
    ];
    const modData: ModData = {
      ...mockModData,
      ...{
        qualities,
      },
    };

    await TestBed.configureTestingModule({
      imports: [TestModule, PickerDialog],
      providers: [
        {
          provide: DIALOG_DATA,
          useFactory: (): PickerData => {
            const settingsStore = inject(SettingsStore);
            return {
              type: 'item',
              allIds: settingsStore.dataset().itemIds,
              selection: qualityId(ItemId.Coal, qualities[0]),
            };
          },
        },
      ],
    }).compileComponents();

    const settingsStore = TestBed.inject(SettingsStore);
    settingsStore['modDataResource'].set(modData);
    fixture = TestBed.createComponent(PickerDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should parse a selected item and apply selected category and quality', () => {
    expect(component['selectedCategory']()).toEqual(CategoryId.Intermediate);
    expect(component['selectedQuality']()).toEqual('1');
  });
});
