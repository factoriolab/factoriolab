import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  sankeyCenter,
  sankeyJustify,
  sankeyLeft,
  sankeyRight,
} from 'd3-sankey';

import { Mocks, TestUtility, initialState } from 'src/tests';
import { OptionsComponent, ColumnsComponent } from '~/components';
import { LinkValue, SankeyAlign } from '~/models';
import {
  SetLinkSizeAction,
  SetLinkTextAction,
  SetSankeyAlignAction,
} from '~/store/preferences';
import { getSankey } from '~/store/products';
import { ExportUtility } from '~/utilities';
import {
  ListComponent,
  ListContainerComponent,
} from '../containers/list-container';
import { FlowComponent } from './flow.component';

enum DataTest {
  Export = 'lab-flow-export',
}

describe('FlowComponent', () => {
  let component: FlowComponent;
  let fixture: ComponentFixture<FlowComponent>;
  let store: MockStore;
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
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    getSankey.setResult(Mocks.Sankey);
    store.refreshState();
    fixture.detectChanges();
    const ref = fixture.debugElement.injector.get(ChangeDetectorRef);
    detectChanges = spyOn(ref.constructor.prototype, 'detectChanges');
    spyOn(store, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    it('should rebuild chart when data/align update', () => {
      spyOn(component, 'rebuildChart');
      getSankey.setResult(Mocks.SankeyCircular);
      store.refreshState();
      expect(component.rebuildChart).toHaveBeenCalledWith(
        Mocks.SankeyCircular,
        SankeyAlign.Justify
      );
    });
  });

  describe('rebuildChart', () => {
    it('should rebuild the chart', () => {
      spyOn(component, 'createChart');
      component.rebuildChart(Mocks.Sankey, SankeyAlign.Justify);
      expect(component.createChart).toHaveBeenCalledWith(
        Mocks.Sankey,
        SankeyAlign.Justify
      );
    });
  });

  describe('createChart', () => {
    it('should handle sankey with circular links', () => {
      component.createChart(Mocks.SankeyCircular, SankeyAlign.Justify);
      expect(component.svg).toBeTruthy();
    });

    it('should handle drag and drop', () => {
      TestUtility.dragAndDropSelector(fixture, 'rect', 100, 200);
      TestUtility.assert(component.svg != null);
      checkTransform(component.svg.select('rect').attr('transform'), 100, 200);
      checkTransform(
        component.svg.select('#image-0').attr('transform'),
        100,
        200
      );
    });

    it('should handle drag and drop for sankey with circular links', () => {
      component.rebuildChart(Mocks.SankeyCircular, SankeyAlign.Justify);
      TestUtility.dragAndDropSelector(fixture, 'rect', 100, 200);
      TestUtility.assert(component.svg != null);
      checkTransform(component.svg.select('rect').attr('transform'), 100, 200);
      checkTransform(
        component.svg.select('#image-0').attr('transform'),
        100,
        200
      );
    });

    it('should call setSelected when a rect is clicked', () => {
      spyOn(component, 'setSelected');
      TestUtility.altClickSelector(fixture, 'rect');
      expect(component.setSelected).toHaveBeenCalledWith(
        Mocks.Sankey.nodes[0].id
      );
    });

    it('should not call setSelected emit when default is prevented', () => {
      spyOn(component, 'setSelected');
      TestUtility.altClickSelector(fixture, 'rect', 0, true);
      expect(component.setSelected).not.toHaveBeenCalled();
    });
  });

  function checkTransform(value: string, x: number, y: number): void {
    const match = /translate\((.+),(.+)\)/g.exec(value);
    TestUtility.assert(match != null);
    const xRound = Math.round(Number(match[1]));
    const yRound = Math.round(Number(match[2]));
    expect(xRound).toEqual(x);
    expect(yRound).toEqual(y);
  }

  describe('getAlign', () => {
    it('should return the proper sankey alignment function', () => {
      expect(component.getAlign(SankeyAlign.Justify)).toEqual(sankeyJustify);
      expect(component.getAlign(SankeyAlign.Left)).toEqual(sankeyLeft);
      expect(component.getAlign(SankeyAlign.Right)).toEqual(sankeyRight);
      expect(component.getAlign(SankeyAlign.Center)).toEqual(sankeyCenter);
    });
  });

  describe('orZero', () => {
    it('should return value or 0', () => {
      expect(component.orZero(1)).toEqual(1);
      expect(component.orZero()).toEqual(0);
    });
  });

  describe('rngY', () => {
    it('should return y1 - y0 or 0', () => {
      expect(component.rngY({ y1: 2, y0: 1 } as any)).toEqual(1);
      expect(component.rngY({} as any)).toEqual(0);
    });
  });

  describe('setSelected', () => {
    it('should set the selected node', () => {
      component.setSelected('node');
      expect(component.selected).toEqual('node');
      expect(detectChanges).toHaveBeenCalled();
    });
  });

  describe('setLinkSize', () => {
    it('should dispatch event', () => {
      const value = LinkValue.Belts;
      component.setLinkSize(value);
      expect(store.dispatch).toHaveBeenCalledWith(new SetLinkSizeAction(value));
    });
  });

  describe('setLinkText', () => {
    it('should dispatch event', () => {
      const value = LinkValue.Belts;
      component.setLinkText(value);
      expect(store.dispatch).toHaveBeenCalledWith(new SetLinkTextAction(value));
    });
  });

  describe('setSankeyAlign', () => {
    it('should dispatch event', () => {
      const value = SankeyAlign.Left;
      component.setSankeyAlign(value);
      expect(store.dispatch).toHaveBeenCalledWith(
        new SetSankeyAlignAction(value)
      );
    });
  });

  describe('export', () => {
    it('should call the utility method to export JSON', () => {
      spyOn(ExportUtility, 'saveAsJson');
      TestUtility.clickDt(fixture, DataTest.Export);
      expect(ExportUtility.saveAsJson).toHaveBeenCalledWith(
        JSON.stringify(Mocks.Sankey)
      );
    });
  });
});
