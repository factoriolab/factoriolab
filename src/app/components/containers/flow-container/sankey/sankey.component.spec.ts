import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResizeObserverEntry } from '@juggle/resize-observer';
import { Subject } from 'rxjs';

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

  describe('ngOnInit', () => {
    it('should set width and height', () => {
      expect(component.child.width).not.toEqual(800);
      expect(component.child.height).not.toEqual(400);
    });

    it('should rebuild the svg if it has already been created', () => {
      spyOn(component.child, 'rebuildChart');
      component.child.svg = true as any;
      component.child.ngOnInit();
      expect(component.child.rebuildChart).toHaveBeenCalled();
    });

    it('should not rebuild the svg if it has not been created', () => {
      spyOn(component.child, 'rebuildChart');
      component.child.svg = false as any;
      component.child.ngOnInit();
      expect(component.child.rebuildChart).not.toHaveBeenCalled();
    });

    it('should call handleResize when detected by NgResizeObserver', () => {
      spyOn(component.child, 'handleResize');
      const resize$ = new Subject<ResizeObserverEntry>();
      component.child.resize$ = resize$;
      component.child.ngOnInit();
      resize$.next(null);
      expect(component.child.handleResize).toHaveBeenCalled();
    });
  });

  describe('handleResize', () => {
    it('should ignore zero values', () => {
      spyOn(component.child, 'rebuildChart');
      component.child.handleResize({
        contentRect: { width: 0, height: 0 },
      } as any);
      expect(component.child.rebuildChart).not.toHaveBeenCalled();
    });

    it('should rebuild the chart if size changes', () => {
      spyOn(component.child, 'rebuildChart');
      component.child.handleResize({
        contentRect: { width: 400, height: 800 },
      } as any);
      expect(component.child.width).toEqual(400);
      expect(component.child.height).toEqual(800);
      expect(component.child.rebuildChart).toHaveBeenCalled();
    });
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
