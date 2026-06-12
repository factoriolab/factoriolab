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
      spyOn(component['settingsStore'], 'customIconsUrl').and.returnValue(
        'url',
      );
      spyOn(component['settingsStore'].customData, 'set');
      spyOn(component['settingsStore'].customIcons, 'set');
      spyOn(component['settingsStore'].customData, 'value').and.returnValue(
        {} as any,
      );
      spyOn<any>(component, 'updateColors').and.returnValue(Promise.resolve());
      const fileReader = {
        onload: (_: any): void => {},
        readAsText: (): void => {
          fileReader.onload({
            target: { result: '{"items":[],"recipes":[]}' },
          });
        },
      };
      spyOn(window, 'FileReader').and.returnValue(fileReader as any);
      await component.save();
      expect(component['updateColors']).toHaveBeenCalledTimes(2);
      expect(component['settingsStore'].customData.set).toHaveBeenCalledWith({
        items: [],
        recipes: [],
      } as any);
      expect(component['settingsStore'].customIcons.set).toHaveBeenCalledWith(
        'iconsFile' as any,
      );
    });
  });

  describe('updateColors', () => {
    it('should fill in colors', async () => {
      const fac = {
        getColorAsync: (): Promise<{ hex: string }> => {
          return Promise.resolve({ hex: '#000' });
        },
      };
      spyOn(fac, 'getColorAsync').and.callThrough();
      (component as any).fac = fac;
      const data = { icons: [{ id: 'id', color: '' }] };
      await component['updateColors'](data as any, 'icons');
      expect(fac.getColorAsync).toHaveBeenCalled();
      expect(data.icons[0].color).toEqual('#000');
    });
  });
});
