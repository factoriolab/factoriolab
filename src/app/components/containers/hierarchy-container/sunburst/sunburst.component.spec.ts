import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import * as Mocks from 'src/mocks';
import { SunburstComponent } from './sunburst.component';
import { TestUtility } from '~/utilities/test';

@Component({
  selector: 'lab-test-sunburst',
  template: ` <lab-sunburst
    [data]="data"
    [diameter]="diameter"
    (setNode)="setNode($event)"
    (setPath)="setPath($event)"
  >
  </lab-sunburst>`,
})
class TestSunburstComponent {
  @ViewChild(SunburstComponent) child: SunburstComponent;
  data = Mocks.Root;
  diameter = 600;
  setNode(data) {}
  setPath(data) {}
}

describe('SunburstComponent', () => {
  SunburstComponent.transition = 0;
  let component: TestSunburstComponent;
  let fixture: ComponentFixture<TestSunburstComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SunburstComponent, TestSunburstComponent],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestSunburstComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  describe('Component', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should create an svg', () => {
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should handle no data', () => {
      component.data = null;
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg).toBeFalsy();
    });

    it('should handle click on element', () => {
      spyOn(component.child, 'click');
      TestUtility.altClickId(fixture, '-arc0' as any);
      fixture.detectChanges();
      expect(component.child.click).toHaveBeenCalledWith(
        component.child.nodeIdMap[Mocks.Root.id]
      );
    });
  });

  describe('Inputs', () => {
    it('should rebuild on data change', () => {
      spyOn(component.child, 'rebuildChart');
      component.data = null;
      fixture.detectChanges();
      expect(component.child.rebuildChart).toHaveBeenCalled();
    });

    it('should rebuild on diameter change', () => {
      spyOn(component.child, 'rebuildChart');
      component.diameter = 100;
      fixture.detectChanges();
      expect(component.child.rebuildChart).toHaveBeenCalled();
    });

    it('should select a node', () => {
      spyOn(component.child, 'click');
      component.child.selectNode('test');
      expect(component.child.click).toHaveBeenCalledWith(undefined);
    });

    it('should ignore null selected nodes', () => {
      spyOn(component.child, 'click');
      component.child.selectNode(null);
      expect(component.child.click).not.toHaveBeenCalled();
    });
  });

  describe('isTooLong', () => {
    it('should return true for null textPath', () => {
      expect(component.child.isTooLong(null, null)).toBeTrue();
    });
  });

  describe('isTextTooLong', () => {
    it('should return true if path is less than min length', () => {
      spyOn(component.child, 'pathLength').and.returnValue(0);
      expect(component.child.isTextTooLong(1)).toBeTrue();
    });

    it('should check with and without ellipses for long text', () => {
      spyOn(component.child, 'isTooLong').and.returnValue(true);
      expect(component.child.isTextTooLong(1)).toBeTrue();
      expect(component.child.isTooLong).toHaveBeenCalledTimes(2);
    });
  });

  describe('getSetTextOverflowFn', () => {
    it('should clip completely if path has no length', () => {
      spyOn(component.child, 'pathLength').and.returnValue(0);
      const fn = component.child.getSetTextOverflowFn(1);
      fn();
      expect(component.child.clipMap[1]).toEqual(Mocks.Node2.name.length);
    });

    it('should clip completely if min text is too long', () => {
      spyOn(component.child, 'isTooLong').and.returnValue(true);
      const fn = component.child.getSetTextOverflowFn(1);
      fn();
      expect(component.child.clipMap[1]).toEqual(Mocks.Node2.name.length);
    });
  });

  describe('binarySearch', () => {
    it('should handle text that begins too long', () => {
      const svgTextPath = { text: (data) => {} };
      spyOn(svgTextPath, 'text');
      const result = component.child.binarySearch(
        1,
        true,
        0,
        'test',
        svgTextPath as any,
        null,
        0
      );
      expect(svgTextPath.text).toHaveBeenCalledWith('...');
    });

    it('should handle equal lower and upper', () => {
      const svgTextPath = { text: (data) => {} };
      spyOn(svgTextPath, 'text');
      const result = component.child.binarySearch(
        1,
        true,
        4,
        'test',
        svgTextPath as any,
        null,
        0
      );
      expect(svgTextPath.text).toHaveBeenCalledWith('');
    });
  });

  describe('createChart', () => {
    it('should reuse old id', () => {
      spyOn(component.child, 'click');
      component.child.rebuildChart();
      expect(component.child.click).toHaveBeenCalledWith(
        component.child.nodeIdMap[Mocks.Root.id]
      );
    });

    it('should hide text that cannot be displayed', () => {
      spyOn(component.child, 'isTextTooLong').and.returnValue(true);
      component.child.rebuildChart();
      const el: HTMLElement = TestUtility.getId(fixture, '-labelText0' as any);
      expect(el.style.visibility).toEqual('hidden');
    });
  });

  describe('click', () => {
    it('should handle null value', () => {
      spyOn(component, 'setNode');
      component.child.click(null);
      expect(component.setNode).not.toHaveBeenCalled();
    });

    it('should handle null id', () => {
      spyOn(component, 'setNode');
      component.child.click({ data: { id: null } } as any);
      expect(component.setNode).not.toHaveBeenCalled();
    });

    it('should ignore if selecting already selected root', () => {
      spyOn(component, 'setNode');
      const id = 'root';
      component.child.nodeId = id;
      component.child.click({ data: { id }, depth: 0 } as any);
      expect(component.setNode).not.toHaveBeenCalled();
    });

    it('should select root if selecting already selected non-root', () => {
      spyOn(component.child, 'click').and.callThrough();
      const id = 'child';
      component.child.nodeId = id;
      component.child.click({ data: { id }, depth: 1 } as any);
      expect(component.child.click).toHaveBeenCalledWith(
        component.child.nodeMap[0]
      );
    });

    it('should handle click on non root', () => {
      spyOn(component, 'setPath');
      component.child.click(component.child.nodeMap[1]);
      expect(component.setPath).toHaveBeenCalledWith([Mocks.Root, Mocks.Node2]);
    });
  });
});
