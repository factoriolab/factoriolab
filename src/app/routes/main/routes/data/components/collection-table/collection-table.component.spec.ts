import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestModule } from 'src/tests';
import { CollectionTableComponent } from './collection-table.component';

describe('CollectionTableComponent', () => {
  let component: CollectionTableComponent;
  let fixture: ComponentFixture<CollectionTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectionTableComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getCollectionRoute', () => {
    it('should get the correct parent route for the collection', () => {
      expect(component.getCollectionRoute('category')).toContain('categories');
      expect(component.getCollectionRoute('item')).toContain('items');
      expect(component.getCollectionRoute('recipe')).toContain('recipes');
      component.useRelativePath = true;
      expect(component.getCollectionRoute('category')).toEqual('');
    });
  });

  describe('getValue', () => {
    it('should get an array of category collection items', () => {
      const result = component.getValue(
        Mocks.RawDataset.categoryIds,
        'category',
        Mocks.RawDataset,
      );
      expect(result.length).toEqual(Mocks.RawDataset.categoryIds.length);
    });

    it('should get an array of item collection items', () => {
      const result = component.getValue(
        Mocks.RawDataset.machineIds,
        'item',
        Mocks.RawDataset,
      );
      expect(result.length).toEqual(Mocks.RawDataset.machineIds.length);
    });

    it('should get an array of recipe collection items', () => {
      const result = component.getValue(
        Mocks.RawDataset.technologyIds,
        'recipe',
        Mocks.RawDataset,
      );
      expect(result.length).toEqual(Mocks.RawDataset.technologyIds.length);
    });
  });
});
