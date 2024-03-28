import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, Mocks, RecipeId, TestModule } from 'src/tests';
import { LabState, Preferences } from '~/store';
import { TechPickerComponent } from './tech-picker.component';

describe('TechPickerComponent', () => {
  let component: TechPickerComponent;
  let fixture: ComponentFixture<TechPickerComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TechPickerComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TechPickerComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('status', () => {
    it('should filter technologies and selection', () => {
      component.clickOpen(Mocks.RawDataset.technologyIds);
      component.filter.set('optics');
      const status = component.status();
      expect(status.available.length).toEqual(0);
      expect(status.locked.length).toEqual(0);
      expect(status.researched.length).toEqual(1);
    });
  });

  describe('clickOpen', () => {
    it('should set up lists of available, locked, and researched technologies', () => {
      component.clickOpen([RecipeId.MiningProductivity]);
      const status = component.status();
      expect(status.available.length).toEqual(8);
      expect(status.researched.length).toEqual(1);
      expect(status.locked.length).toEqual(183);
    });

    it('should handle null selection', () => {
      component.clickOpen(null);
      const status = component.status();
      expect(status.available.length).toEqual(0);
      expect(status.researched.length).toEqual(192);
      expect(status.locked.length).toEqual(0);
    });
  });

  describe('selectAll', () => {
    it('should set the selection to all', () => {
      spyOn(component.selection, 'set');
      component.selectAll(true);
      expect(component.selection.set).toHaveBeenCalledWith(
        Mocks.RawDataset.technologyIds,
      );
    });

    it('should set the selection to empty', () => {
      spyOn(component.selection, 'set');
      component.selectAll(false);
      expect(component.selection.set).toHaveBeenCalledWith([]);
    });
  });

  describe('openImport', () => {
    it('should mark the dialog as visible and focus the textarea', fakeAsync(() => {
      const input = { focus: (): void => {} };
      spyOn(input, 'focus');
      component.openImport(input as any);
      tick();
      expect(component.importVisible).toBeTrue();
      expect(input.focus).toHaveBeenCalled();
    }));
  });

  describe('copyScriptToClipboard', () => {
    it('should copy to clipboard and show a toast', () => {
      spyOn(window.navigator.clipboard, 'writeText');
      spyOn(component.contentSvc.showToast$, 'next');
      component.copyScriptToClipboard();
      expect(window.navigator.clipboard.writeText).toHaveBeenCalled();
      expect(component.contentSvc.showToast$.next).toHaveBeenCalled();
    });
  });

  describe('importTechs', () => {
    it('should match technology ids and handle bad / empty', () => {
      component.importValue = 'automation,fast-inserter,asdf,';
      component.importTechs();
      expect(component.selection()).toEqual([
        'automation',
        'fast-inserter-technology',
        'electronics',
      ]);
    });
  });

  describe('clickId', () => {
    it('should add the id and any dependencies to the selection', () => {
      spyOn(component.selection, 'set');
      component.clickId(RecipeId.Electronics);
      expect(component.selection.set).toHaveBeenCalledWith([
        RecipeId.Electronics,
        RecipeId.Automation,
      ]);
    });

    it('should remove id and any dependencies from the selection', () => {
      component.selection.set([RecipeId.Electronics, RecipeId.Automation]);
      spyOn(component.selection, 'set');
      component.clickId(RecipeId.Automation);
      expect(component.selection.set).toHaveBeenCalledWith([]);
    });
  });

  describe('onHide', () => {
    it('should emit the selection filtered to a minimal set', () => {
      component.selection.set([RecipeId.Electronics, RecipeId.Automation]);
      spyOn(component.selectIds, 'emit');
      component.onHide();
      expect(component.selectIds.emit).toHaveBeenCalledWith([
        RecipeId.Electronics,
      ]);
    });

    it('should emit null if all technologies are selected', () => {
      component.selection.set(Mocks.RawDataset.technologyIds);
      spyOn(component.selectIds, 'emit');
      component.onHide();
      expect(component.selectIds.emit).toHaveBeenCalledWith(null);
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.val('setShowTechLabels', Preferences.SetShowTechLabelsAction);
  });
});
