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
    fixture.componentRef.setInput('ids', Mocks.RawDataset.categoryIds);
    fixture.componentRef.setInput('type', 'category');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('route', () => {
    it('should get the correct parent route for the collection', () => {
      expect(component.route()).toContain('categories');
      fixture.componentRef.setInput('type', 'item');
      expect(component.route()).toContain('items');
      fixture.componentRef.setInput('type', 'recipe');
      expect(component.route()).toContain('recipes');
      fixture.componentRef.setInput('useRelativePath', true);
      expect(component.route()).toEqual('');
    });
  });

  describe('balue', () => {
    it('should get an array of category collection items', () => {
      expect(component.value().length).toEqual(
        Mocks.RawDataset.categoryIds.length,
      );
    });

    it('should get an array of item collection items', () => {
      fixture.componentRef.setInput('ids', Mocks.RawDataset.machineIds);
      fixture.componentRef.setInput('type', 'item');
      expect(component.value().length).toEqual(
        Mocks.RawDataset.machineIds.length,
      );
    });

    it('should get an array of recipe collection items', () => {
      fixture.componentRef.setInput('ids', Mocks.RawDataset.technologyIds);
      fixture.componentRef.setInput('type', 'recipe');
      expect(component.value().length).toEqual(
        Mocks.RawDataset.technologyIds.length,
      );
    });
  });
});
