import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';

import { reducers, metaReducers } from '~/store';
import { ListComponent, ListContainerComponent } from '../list-container';
import { SankeyComponent } from './sankey/sankey.component';
import { FlowContainerComponent } from './flow-container.component';

describe('FlowContainerComponent', () => {
  let component: FlowContainerComponent;
  let fixture: ComponentFixture<FlowContainerComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        SankeyComponent,
        ListComponent,
        ListContainerComponent,
        FlowContainerComponent,
      ],
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
