import { DIALOG_DATA } from '@angular/cdk/dialog';
import { inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsStore } from '~/state/settings/settings-store';
import { TestModule } from '~/tests/test-module';

import { PickerData } from './picker-data';
import { PickerDialog } from './picker-dialog';

describe('PickerDialog', () => {
  let component: PickerDialog;
  let fixture: ComponentFixture<PickerDialog>;

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
});
