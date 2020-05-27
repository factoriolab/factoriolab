import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';

import { reducers, metaReducers } from '~/store';
import { ListComponent, ListContainerComponent } from '../list-container';
import { SunburstComponent } from './sunburst/sunburst.component';
import { HierarchyContainerComponent } from './hierarchy-container.component';

describe('HierarchyContainerComponent', () => {
  let component: HierarchyContainerComponent;
  let fixture: ComponentFixture<HierarchyContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SunburstComponent,
        ListComponent,
        ListContainerComponent,
        HierarchyContainerComponent,
      ],
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchyContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
