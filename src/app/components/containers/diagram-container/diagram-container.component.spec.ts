import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';

import { reducers, metaReducers } from '~/store';
import { ListComponent, ListContainerComponent } from '../list-container';
import { SankeyComponent } from './sankey/sankey.component';
import { DiagramContainerComponent } from './diagram-container.component';

describe('DiagramContainerComponent', () => {
  let component: DiagramContainerComponent;
  let fixture: ComponentFixture<DiagramContainerComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        SankeyComponent,
        ListComponent,
        ListContainerComponent,
        DiagramContainerComponent,
      ],
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagramContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('steps', () => {
    it('should handle no selection', () => {
      component.selected = null;
      expect(component.steps).toEqual([]);
    });

    it('should get steps from root node', () => {
      const value = ['test'] as any;
      component.selected = { id: 'root', children: value } as any;
      expect(component.steps).toEqual(value);
    });

    it('should get steps from intermediate node', () => {
      const value = ['test'] as any;
      component.selected = { id: 'id', children: value } as any;
      expect(component.steps.length).toEqual(2);
      expect(component.steps[1]).toEqual(value[0]);
    });

    it('should get steps from leaf node', () => {
      const value = { id: 'id' } as any;
      component.selected = value;
      expect(component.steps).toEqual([value]);
    });
  });
});
