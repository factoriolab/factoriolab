import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsStore } from '~/state/settings/settings-store';
import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';
import { spread } from '~/utils/object';

import { CollectionTable } from './collection-table';

describe('CollectionTable', () => {
  let component: CollectionTable;
  let fixture: ComponentFixture<CollectionTable>;
  let settingsStore: SettingsStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, CollectionTable],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionTable);
    settingsStore = TestBed.inject(SettingsStore);
    setInputs(fixture, {
      ids: settingsStore.dataset().recipeIds,
      key: 'recipe',
      iconType: 'recipe',
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('items', () => {
    it('should apply a filter', () => {
      component.state.update((state) => spread(state, { filter: 'wooden' }));
      expect(component['entries']()).toHaveSize(1);
    });

    it('should sort by category', () => {
      const original = component['entries']();
      component.state.update((state) => spread(state, { sort: 'category' }));
      expect(component['entries']()).not.toEqual(original);
    });

    it('should sort by name', () => {
      const original = component['entries']();
      component.state.update((state) =>
        spread(state, { sort: 'name', asc: true }),
      );
      expect(component['entries']()).not.toEqual(original);
    });
  });
});
