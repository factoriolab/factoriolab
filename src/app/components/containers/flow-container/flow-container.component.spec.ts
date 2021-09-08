import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';

import { TestUtility } from 'src/tests';
import { OptionsComponent, ColumnsComponent } from '~/components';
import { LinkValue, SankeyAlign } from '~/models';
import { reducers, metaReducers, State } from '~/store';
import {
  SetLinkSizeAction,
  SetLinkTextAction,
  SetSankeyAlignAction,
} from '~/store/preferences';
import { ListComponent, ListContainerComponent } from '../list-container';
import { SankeyComponent } from './sankey/sankey.component';
import { FlowContainerComponent } from './flow-container.component';
import { ExportUtility } from '~/utilities';

enum DataTest {
  Export = 'lab-flow-container-export',
}

describe('FlowContainerComponent', () => {
  let component: FlowContainerComponent;
  let fixture: ComponentFixture<FlowContainerComponent>;
  let store: Store<State>;
  let detectChanges: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ColumnsComponent,
        OptionsComponent,
        SankeyComponent,
        ListComponent,
        ListContainerComponent,
        FlowContainerComponent,
      ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(Store);
    const ref = fixture.debugElement.injector.get(ChangeDetectorRef);
    detectChanges = spyOn(ref.constructor.prototype, 'detectChanges');
    spyOn(store, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the selected node', () => {
    component.setSelected('node');
    expect(component.selected).toEqual('node');
    expect(detectChanges).toHaveBeenCalled();
  });

  it('should set the link size', () => {
    const value = LinkValue.Belts;
    component.setLinkSize(value);
    expect(store.dispatch).toHaveBeenCalledWith(new SetLinkSizeAction(value));
  });

  it('should set the link text', () => {
    const value = LinkValue.Belts;
    component.setLinkText(value);
    expect(store.dispatch).toHaveBeenCalledWith(new SetLinkTextAction(value));
  });

  it('should set the sankey alignment', () => {
    const value = SankeyAlign.Left;
    component.setSankeyAlign(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SetSankeyAlignAction(value)
    );
  });

  it('should call the utility method to export JSON', () => {
    spyOn(ExportUtility, 'saveAsJson');
    TestUtility.clickDt(fixture, DataTest.Export);
    expect(ExportUtility.saveAsJson).toHaveBeenCalledWith(
      '{"nodes":[],"links":[]}'
    );
  });
});
