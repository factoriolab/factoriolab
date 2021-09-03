import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  sankeyCenter,
  sankeyJustify,
  sankeyLeft,
  sankeyRight,
} from 'd3-sankey';

import { Mocks, TestUtility } from 'src/tests';
import { SankeyAlign } from '~/models';
import { SankeyComponent } from './sankey.component';

@Component({
  selector: 'lab-test-sankey',
  template: `<lab-sankey
    [sankeyData]="sankeyData"
    (selectNode)="selectNode($event)"
  ></lab-sankey>`,
})
class TestSankeyComponent {
  @ViewChild(SankeyComponent) child: SankeyComponent;
  sankeyData = Mocks.Sankey;
  selectNode(data): void {}
}

describe('SankeyComponent', () => {
  let component: TestSankeyComponent;
  let fixture: ComponentFixture<TestSankeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SankeyComponent, TestSankeyComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle sankey with circular links', () => {
    spyOn(component.child, 'createChart').and.callThrough();
    component.sankeyData = Mocks.SankeyCircular;
    fixture.detectChanges();
    expect(component.child.createChart).toHaveBeenCalled();
    expect(component.child.svg).toBeTruthy();
  });

  describe('rebuildChart', () => {
    it('should rebuild the chart', () => {
      spyOn(component.child, 'createChart');
      component.child.rebuildChart();
      expect(component.child.createChart).toHaveBeenCalled();
    });

    it('should ignore data with no nodes or links', () => {
      spyOn(component.child, 'createChart');
      component.child.sankeyData = { nodes: [], links: [] };
      component.child.rebuildChart();
      expect(component.child.createChart).not.toHaveBeenCalled();
    });
  });

  describe('selectNode', () => {
    it('should emit when a rect is clicked', () => {
      spyOn(component, 'selectNode');
      fixture.detectChanges();
      TestUtility.altClickSelector(fixture, 'rect');
      expect(component.selectNode).toHaveBeenCalledWith(
        Mocks.Sankey.nodes[0].id
      );
    });

    it('should not emit when default is prevented', () => {
      spyOn(component, 'selectNode');
      fixture.detectChanges();
      TestUtility.altClickSelector(fixture, 'rect', 0, true);
      expect(component.selectNode).not.toHaveBeenCalledWith(
        Mocks.Sankey.nodes[0].id
      );
    });
  });

  describe('getAlign', () => {
    it('should return the proper sankey alignment function', () => {
      expect(component.child.getAlign(SankeyAlign.Justify)).toEqual(
        sankeyJustify
      );
      expect(component.child.getAlign(SankeyAlign.Left)).toEqual(sankeyLeft);
      expect(component.child.getAlign(SankeyAlign.Right)).toEqual(sankeyRight);
      expect(component.child.getAlign(SankeyAlign.Center)).toEqual(
        sankeyCenter
      );
    });
  });

  it('should handle drag and drop', () => {
    TestUtility.dragAndDropSelector(fixture, 'rect', 100, 200);
    checkTransform(
      component.child.svg.select('rect').attr('transform'),
      100,
      200
    );
    checkTransform(
      component.child.svg.select('#image-0').attr('transform'),
      100,
      200
    );
  });

  it('should handle drag and drop for sankey with circular links', () => {
    component.sankeyData = Mocks.SankeyCircular;
    fixture.detectChanges();
    TestUtility.dragAndDropSelector(fixture, 'rect', 100, 200);
    checkTransform(
      component.child.svg.select('rect').attr('transform'),
      100,
      200
    );
    checkTransform(
      component.child.svg.select('#image-0').attr('transform'),
      100,
      200
    );
  });

  function checkTransform(value: string, x: number, y: number): void {
    const match = /translate\((.+),(.+)\)/g.exec(value);
    const xRound = Math.round(Number(match[1]));
    const yRound = Math.round(Number(match[2]));
    expect(xRound).toEqual(x);
    expect(yRound).toEqual(y);
  }
});
