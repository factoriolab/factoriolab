import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';

import { CustomDataDialog } from './custom-data-dialog';

describe('CustomDataDialog', () => {
  let component: CustomDataDialog;
  let fixture: ComponentFixture<CustomDataDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, CustomDataDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomDataDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selectFile', () => {
    it('should select the data and icons file from loaded files', () => {
      const dataFile: any = { type: 'application/json' };
      const iconsFile: any = { type: 'image' };
      component.selectFile({ target: { files: [dataFile, iconsFile] } } as any);
      expect(component['dataFile']).toEqual(dataFile);
      expect(component['iconsFile']).toEqual(iconsFile);
    });

    it('should return early if no files are present', () => {
      component.selectFile({ target: {} } as any);
      expect(component['dataFile']).toBeUndefined();
      expect(component['iconsFile']).toBeUndefined();
    });
  });

  describe('save', () => {
    it('should save the data and icons file to the settingsStore', async () => {
      component['dataFile'] = new Blob(['text'], { type: 'text/plain' }) as any;
      component['iconsFile'] = 'iconsFile' as any;
      spyOn(component['settingsStore'], 'setCustomData');
      spyOn(component['settingsStore'].customIcons, 'set');
      component.save();
      await TestBed.inject(ApplicationRef).whenStable();
      expect(component['settingsStore'].setCustomData).toHaveBeenCalledWith(
        'text',
      );
      expect(component['settingsStore'].customIcons.set).toHaveBeenCalledWith(
        'iconsFile' as any,
      );
    });
  });
});
