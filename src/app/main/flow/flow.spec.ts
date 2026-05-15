import { ComponentFixture, TestBed } from '@angular/core/testing';
import { select } from 'd3';

import { FlowDiagram } from '~/state/preferences/flow-diagram';
import { mockFlowSettings } from '~/tests/mocks/flow';
import { Mocks } from '~/tests/mocks/mocks';
import { TestModule } from '~/tests/test-module';
import { spread } from '~/utils/object';

import { Flow, SVG_ID } from './flow';

describe('Flow', () => {
  let component: Flow;
  let fixture: ComponentFixture<Flow>;
  let mocks: Mocks;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Flow],
    }).compileComponents();

    mocks = TestBed.inject(Mocks);
    fixture = TestBed.createComponent(Flow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rebuildChart', () => {
    it('should call to rebuild the sankey', async () => {
      spyOn(component, 'rebuildSankey');
      await component.rebuildChart(mocks.flow(), mockFlowSettings);
      expect(component.rebuildSankey).toHaveBeenCalledWith(
        mocks.flow(),
        mockFlowSettings,
      );
    });

    it('should call to rebuild the box-line', async () => {
      spyOn(component, 'rebuildBoxLine');
      const flow = mocks.flow();
      const flowSettings = spread(mockFlowSettings, {
        diagram: FlowDiagram.BoxLine,
      });
      await component.rebuildChart(flow, flowSettings);
      expect(component.rebuildBoxLine).toHaveBeenCalledWith(flow, flowSettings);
    });
  });

  describe('rebuildSankey', () => {
    beforeEach(() => {
      select(`#${SVG_ID} > *`).remove();
    });

    it('should build the sankey', () => {
      component.rebuildSankey(mocks.flow(), mockFlowSettings);
      const gElements = document.getElementsByTagName('g');
      expect(gElements.length).toEqual(8);
    });
  });
});
