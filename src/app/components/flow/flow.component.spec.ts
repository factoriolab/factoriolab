import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';

import { Mocks, TestUtility } from 'src/tests';
import { OptionsComponent, ColumnsComponent } from '~/components';
import { LinkValue, SankeyAlign } from '~/models';
import { reducers, metaReducers, State } from '~/store';
import {
  SetLinkSizeAction,
  SetLinkTextAction,
  SetSankeyAlignAction,
} from '~/store/preferences';
import {
  ListComponent,
  ListContainerComponent,
} from '../containers/list-container';
import { FlowComponent } from './flow.component';
import { ExportUtility } from '~/utilities';

enum DataTest {
  Export = 'lab-flow-export',
}

describe('FlowComponent', () => {
  let component: FlowComponent;
  let fixture: ComponentFixture<FlowComponent>;
  let store: Store<State>;
  let detectChanges: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ColumnsComponent,
        OptionsComponent,
        ListComponent,
        ListContainerComponent,
        FlowComponent,
      ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowComponent);
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

  // it('should handle sankey with circular links', () => {
  //   spyOn(component, 'createChart').and.callThrough();
  //   component.sankeyData = Mocks.SankeyCircular;
  //   fixture.detectChanges();
  //   expect(component.createChart).toHaveBeenCalled();
  //   expect(component.svg).toBeTruthy();
  // });

  // describe('rebuildChart', () => {
  //   it('should rebuild the chart', () => {
  //     spyOn(component, 'createChart');
  //     component.rebuildChart();
  //     expect(component.createChart).toHaveBeenCalled();
  //   });

  //   it('should ignore data with no nodes or links', () => {
  //     spyOn(component.child, 'createChart');
  //     component.child.sankeyData = { nodes: [], links: [] };
  //     component.child.rebuildChart();
  //     expect(component.child.createChart).not.toHaveBeenCalled();
  //   });
  // });

  // describe('selectNode', () => {
  //   it('should emit when a rect is clicked', () => {
  //     spyOn(component, 'selectNode');
  //     fixture.detectChanges();
  //     TestUtility.altClickSelector(fixture, 'rect');
  //     expect(component.selectNode).toHaveBeenCalledWith(
  //       Mocks.Sankey.nodes[0].id
  //     );
  //   });

  //   it('should not emit when default is prevented', () => {
  //     spyOn(component, 'selectNode');
  //     fixture.detectChanges();
  //     TestUtility.altClickSelector(fixture, 'rect', 0, true);
  //     expect(component.selectNode).not.toHaveBeenCalledWith(
  //       Mocks.Sankey.nodes[0].id
  //     );
  //   });
  // });

  // describe('getAlign', () => {
  //   it('should return the proper sankey alignment function', () => {
  //     expect(component.child.getAlign(SankeyAlign.Justify)).toEqual(
  //       sankeyJustify
  //     );
  //     expect(component.child.getAlign(SankeyAlign.Left)).toEqual(sankeyLeft);
  //     expect(component.child.getAlign(SankeyAlign.Right)).toEqual(sankeyRight);
  //     expect(component.child.getAlign(SankeyAlign.Center)).toEqual(
  //       sankeyCenter
  //     );
  //   });
  // });

  // it('should handle drag and drop', () => {
  //   TestUtility.dragAndDropSelector(fixture, 'rect', 100, 200);
  //   checkTransform(
  //     component.child.svg.select('rect').attr('transform'),
  //     100,
  //     200
  //   );
  //   checkTransform(
  //     component.child.svg.select('#image-0').attr('transform'),
  //     100,
  //     200
  //   );
  // });

  // it('should handle drag and drop for sankey with circular links', () => {
  //   component.sankeyData = Mocks.SankeyCircular;
  //   fixture.detectChanges();
  //   TestUtility.dragAndDropSelector(fixture, 'rect', 100, 200);
  //   checkTransform(
  //     component.child.svg.select('rect').attr('transform'),
  //     100,
  //     200
  //   );
  //   checkTransform(
  //     component.child.svg.select('#image-0').attr('transform'),
  //     100,
  //     200
  //   );
  // });

  // function checkTransform(value: string, x: number, y: number): void {
  //   const match = /translate\((.+),(.+)\)/g.exec(value);
  //   const xRound = Math.round(Number(match[1]));
  //   const yRound = Math.round(Number(match[2]));
  //   expect(xRound).toEqual(x);
  //   expect(yRound).toEqual(y);
  // }

  // it('should set the selected node', () => {
  //   component.setSelected('node');
  //   expect(component.selected).toEqual('node');
  //   expect(detectChanges).toHaveBeenCalled();
  // });

  // it('should set the link size', () => {
  //   const value = LinkValue.Belts;
  //   component.setLinkSize(value);
  //   expect(store.dispatch).toHaveBeenCalledWith(new SetLinkSizeAction(value));
  // });

  // it('should set the link text', () => {
  //   const value = LinkValue.Belts;
  //   component.setLinkText(value);
  //   expect(store.dispatch).toHaveBeenCalledWith(new SetLinkTextAction(value));
  // });

  // it('should set the sankey alignment', () => {
  //   const value = SankeyAlign.Left;
  //   component.setSankeyAlign(value);
  //   expect(store.dispatch).toHaveBeenCalledWith(
  //     new SetSankeyAlignAction(value)
  //   );
  // });

  // it('should call the utility method to export JSON', () => {
  //   spyOn(ExportUtility, 'saveAsJson');
  //   TestUtility.clickDt(fixture, DataTest.Export);
  //   expect(ExportUtility.saveAsJson).toHaveBeenCalledWith(
  //     '{"nodes":[],"links":[]}'
  //   );
  // });
});
