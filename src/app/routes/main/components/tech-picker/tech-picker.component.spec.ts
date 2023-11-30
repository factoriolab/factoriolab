import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, Mocks, RecipeId, TestModule } from 'src/tests';
import { ContentService } from '~/services';
import { LabState, Preferences } from '~/store';
import { TechPickerComponent, UnlockStatus } from './tech-picker.component';

describe('TechPickerComponent', () => {
  let component: TechPickerComponent;
  let fixture: ComponentFixture<TechPickerComponent>;
  let mockStore: MockStore<LabState>;
  let contentSvc: ContentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TechPickerComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TechPickerComponent);
    mockStore = TestBed.inject(MockStore);
    contentSvc = TestBed.inject(ContentService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('filter', () => {
    it('should filter technologies and selection', () => {
      let status: Record<UnlockStatus, string[]> | undefined;
      component.status$.subscribe((s) => (status = s));
      component.clickOpen(Mocks.Dataset, Mocks.RawDataset.technologyIds);
      component.filter$.next('optics');
      expect(status?.available.length).toEqual(0);
      expect(status?.locked.length).toEqual(0);
      expect(status?.researched.length).toEqual(1);
    });
  });

  describe('clickOpen', () => {
    it('should set up lists of available, locked, and researched technologies', () => {
      let status: Record<UnlockStatus, string[]> | undefined;
      component.status$.subscribe((s) => (status = s));
      component.clickOpen(Mocks.Dataset, [RecipeId.MiningProductivity]);
      expect(status?.available.length).toEqual(8);
      expect(status?.researched.length).toEqual(1);
      expect(status?.locked.length).toEqual(183);
    });

    it('should handle null selection', () => {
      let status: Record<UnlockStatus, string[]> | undefined;
      component.status$.subscribe((s) => (status = s));
      component.clickOpen(Mocks.Dataset, null);
      expect(status?.available.length).toEqual(0);
      expect(status?.researched.length).toEqual(192);
      expect(status?.locked.length).toEqual(0);
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
      spyOn(contentSvc.showToast$, 'next');
      component.copyScriptToClipboard();
      expect(window.navigator.clipboard.writeText).toHaveBeenCalled();
      expect(contentSvc.showToast$.next).toHaveBeenCalled();
    });
  });

  describe('importTechs', () => {
    it('should match technology ids and handle bad / empty', () => {
      spyOn(component.selection$, 'next');
      component.importValue = 'automation,fast-inserter,asdf,';
      component.importTechs(Mocks.Dataset);
      expect(component.selection$.next).toHaveBeenCalledWith([
        'automation',
        'fast-inserter-technology',
        'electronics',
      ]);
    });
  });

  describe('selectAll', () => {
    it('should set the selection to all', () => {
      spyOn(component.selection$, 'next');
      component.selectAll(true, Mocks.Dataset);
      expect(component.selection$.next).toHaveBeenCalledWith(
        Mocks.RawDataset.technologyIds,
      );
    });

    it('should set the selection to empty', () => {
      spyOn(component.selection$, 'next');
      component.selectAll(false, Mocks.Dataset);
      expect(component.selection$.next).toHaveBeenCalledWith([]);
    });
  });

  describe('clickId', () => {
    it('should add the id and any dependencies to the selection', () => {
      spyOn(component.selection$, 'next');
      component.clickId(RecipeId.Electronics, [], Mocks.Dataset);
      expect(component.selection$.next).toHaveBeenCalledWith([
        RecipeId.Electronics,
        RecipeId.Automation,
      ]);
    });

    it('should remove id and any dependencies from the selection', () => {
      spyOn(component.selection$, 'next');
      component.clickId(
        RecipeId.Automation,
        [RecipeId.Electronics, RecipeId.Automation],
        Mocks.Dataset,
      );
      expect(component.selection$.next).toHaveBeenCalledWith([]);
    });
  });

  describe('onHide', () => {
    it('should emit the selection filtered to a minimal set', () => {
      spyOn(component.selectIds, 'emit');
      component.onHide(
        [RecipeId.Electronics, RecipeId.Automation],
        Mocks.Dataset,
      );
      expect(component.selectIds.emit).toHaveBeenCalledWith([
        RecipeId.Electronics,
      ]);
    });

    it('should emit null if all technologies are selected', () => {
      spyOn(component.selectIds, 'emit');
      component.onHide(Mocks.RawDataset.technologyIds, Mocks.Dataset);
      expect(component.selectIds.emit).toHaveBeenCalledWith(null);
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.val('setShowTechLabels', Preferences.SetShowTechLabelsAction);
  });
});
