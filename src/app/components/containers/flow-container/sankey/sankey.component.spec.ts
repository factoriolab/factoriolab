import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestUtility } from 'src/tests';
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
  });
});
