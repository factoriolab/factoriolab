import { Component, ViewChild } from '@angular/core';
import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { MockSunburstData } from 'mocks/sunburst.data';
import { TestUtility } from 'app/shared/utilities/test';
import { SunburstComponent } from './sunburst.component';

const TIME = 0;
const IE10UA =
  'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)';
const IE11UA = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
const EdgeUA =
  'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10136';
export const TIME_TICK = TIME + 50; // Needs a bit of extra time to actually do the transition

@Component({
  selector: 'osi-test-sunburst',
  template: `
    <div [style.display]="display">
      <osi-sunburst
        [transition]="time"
        [rebuildDebounce]="time"
        [minPathLength]="minPathLength"
        [idField]="idField"
        [data]="data"
        [power]="power"
        [diameter]="diameter"
        [selected]="selected"
        (select)="select($event)"
        (path)="path($event)">
      </osi-sunburst>
    </div>`
})
class TestSunburstComponent {
  @ViewChild(SunburstComponent) child: SunburstComponent;

  display = 'block';

  time = TIME;
  minPathLength = 10;
  idField = 'id';
  data = MockSunburstData;
  power = 0.75;
  diameter = 600;
  selected = null;
  select(data) {}
  path(data) {}
}

describe('SunburstComponent', () => {
  SunburstComponent.testing = true;
  let component: TestSunburstComponent;
  let fixture: ComponentFixture<TestSunburstComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SunburstComponent, TestSunburstComponent]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestSunburstComponent);
        component = fixture.componentInstance;
      });
  }));

  it(
    'should create',
    fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(component).toBeTruthy();
    })
  );

  describe('Rendering', () => {
    it(
      'should create an svg',
      fakeAsync(() => {
        fixture.detectChanges();
        tick();
        const svg = fixture.nativeElement.querySelector('svg');
        expect(svg).toBeTruthy();
      })
    );

    it(
      'should handle changes to inputs',
      fakeAsync(() => {
        fixture.detectChanges();
        tick();

        spyOn(component.child, 'createChart');
        spyOn(component, 'select');

        component.selected = 2;
        fixture.detectChanges();
        tick(TIME_TICK);
        expect(component.select).toHaveBeenCalledWith(
          MockSunburstData.children[1]
        );

        component.power = 1;
        fixture.detectChanges();
        tick(TIME_TICK);
        expect(component.child.createChart).toHaveBeenCalledTimes(1);

        component.diameter = 100;
        fixture.detectChanges();
        tick(TIME_TICK);
        expect(component.child.createChart).toHaveBeenCalledTimes(2);
      })
    );

    it(
      'should account for IE10-',
      fakeAsync(() => {
        component.child['_ua'] = IE10UA;
        fixture.detectChanges();
        tick();
        const svg = fixture.nativeElement.querySelector('svg');
        expect(svg).toBeTruthy();
      })
    );

    it(
      'should account for IE11',
      fakeAsync(() => {
        component.child['_ua'] = IE11UA;
        fixture.detectChanges();
        tick();
        const svg = fixture.nativeElement.querySelector('svg');
        expect(svg).toBeTruthy();
      })
    );

    it(
      'should account for Edge',
      fakeAsync(() => {
        component.child['_ua'] = EdgeUA;
        fixture.detectChanges();
        tick();
        const svg = fixture.nativeElement.querySelector('svg');
        expect(svg).toBeTruthy();
      })
    );

    it(
      'should rebuild when it becomes visible',
      fakeAsync(() => {
        component.display = 'none';
        fixture.detectChanges();
        tick();
        spyOn(component.child, 'rebuildChart');
        component.display = 'block';
        fixture.detectChanges();
        tick();
        expect(component.child.rebuildChart).toHaveBeenCalledTimes(1);
      })
    );

    it(
      'should handle minPathLength',
      fakeAsync(() => {
        component.minPathLength = 1000;
        fixture.detectChanges();
        tick();
        const svg = fixture.nativeElement.querySelector('svg');
        expect(svg).toBeTruthy();
      })
    );

    it(
      'should handle no data',
      fakeAsync(() => {
        component.data = null;
        fixture.detectChanges();
        tick();
        const svg = fixture.nativeElement.querySelector('svg');
        expect(svg).toBeFalsy();
      })
    );

    it(
      'should mouseover/mouseleave',
      fakeAsync(() => {
        fixture.detectChanges();
        tick();

        const arc1: SVGTextPathElement = TestUtility.getId(fixture, '-arc1');
        const arc4: SVGTextPathElement = TestUtility.getId(fixture, '-arc4');
        TestUtility.dispatchId(fixture, '-arc1', 'mouseover');
        expect(arc1.classList.contains('hover')).toBe(true);
        TestUtility.dispatchId(fixture, '-arc1', 'mouseleave');
        expect(arc1.classList.contains('hover')).toBe(false);
        TestUtility.dispatchId(fixture, '-arc4', 'mouseover');
        expect(arc4.classList.contains('hover')).toBe(true);
        TestUtility.dispatchId(fixture, '-arc4', 'mouseleave');
        expect(arc4.classList.contains('hover')).toBe(false);
      })
    );
  });

  describe('Selection', () => {
    it(
      'should output selected and path',
      fakeAsync(() => {
        spyOn(component, 'select');
        spyOn(component, 'path');

        fixture.detectChanges();
        tick();

        TestUtility.altClickId(fixture, '-arc1');
        fixture.detectChanges();
        tick(TIME_TICK);

        expect(component.select).toHaveBeenCalledWith(
          MockSunburstData.children[0]
        );
        expect(component.path).toHaveBeenCalledWith([
          MockSunburstData,
          MockSunburstData.children[0]
        ]);

        TestUtility.altClickId(fixture, '-arc4');
        fixture.detectChanges();
        tick(TIME_TICK);

        expect(component.select).toHaveBeenCalledWith(
          MockSunburstData.children[0].children[0]
        );
        expect(component.path).toHaveBeenCalledWith([
          MockSunburstData,
          MockSunburstData.children[0],
          MockSunburstData.children[0].children[0]
        ]);
      })
    );

    it(
      'should return to root on second click',
      fakeAsync(() => {
        spyOn(component, 'select');
        spyOn(component, 'path');

        fixture.detectChanges();
        tick();

        TestUtility.altClickId(fixture, '-arc4');
        fixture.detectChanges();
        tick(TIME_TICK);

        expect(component.select).toHaveBeenCalledWith(
          MockSunburstData.children[0].children[0]
        );
        expect(component.path).toHaveBeenCalledWith([
          MockSunburstData,
          MockSunburstData.children[0],
          MockSunburstData.children[0].children[0]
        ]);

        TestUtility.altClickId(fixture, '-arc4');
        fixture.detectChanges();
        tick(TIME_TICK);

        expect(component.select).toHaveBeenCalledWith(MockSunburstData);
        expect(component.path).toHaveBeenCalledWith([MockSunburstData]);
      })
    );

    it(
      'should not go to root if already at root',
      fakeAsync(() => {
        spyOn(component, 'select');

        fixture.detectChanges();
        tick();

        TestUtility.altClickId(fixture, '-arc0');
        fixture.detectChanges();
        tick(TIME_TICK);

        TestUtility.altClickId(fixture, '-arc0');
        fixture.detectChanges();
        tick(TIME_TICK);

        expect(component.select).toHaveBeenCalledTimes(1);
      })
    );

    it(
      'should work with no idField',
      fakeAsync(() => {
        component.idField = null;
        fixture.detectChanges();
        tick();
        const svg = fixture.nativeElement.querySelector('svg');
        expect(svg).toBeTruthy();

        spyOn(component, 'select');
        spyOn(component, 'path');

        TestUtility.altClickId(fixture, '-arc2');
        fixture.detectChanges();
        tick(TIME_TICK);

        expect(component.select).toHaveBeenCalledWith(
          MockSunburstData.children[1]
        );
        expect(component.path).toHaveBeenCalledWith([
          MockSunburstData,
          MockSunburstData.children[1]
        ]);
      })
    );

    it(
      'should handle clicking invalid node',
      fakeAsync(() => {
        spyOn(component, 'select');
        component.idField = null;
        fixture.detectChanges();
        tick();
        component.child.click(null);
        expect(component.select).toHaveBeenCalledTimes(0);
        component.child.click({ data: {} } as any);
        expect(component.select).toHaveBeenCalledTimes(0);
      })
    );

    it(
      'should reselect selected id on rebuild',
      fakeAsync(() => {
        fixture.detectChanges();
        tick();
        TestUtility.altClickId(fixture, '-arc2');
        fixture.detectChanges();
        tick(TIME_TICK);
        let id;
        spyOn(component.child, 'click').and.callFake(d => {
          id = d.data.id;
        });
        component.child.createChart();
        expect(id).toEqual(MockSunburstData.children[1].id);
      })
    );

    it(
      'should select root id on rebuild if old id not found',
      fakeAsync(() => {
        fixture.detectChanges();
        tick();
        TestUtility.altClickId(fixture, '-arc2');
        fixture.detectChanges();
        tick(TIME_TICK);
        component.data = MockSunburstData.children[0];
        fixture.detectChanges();
        tick();
        let id;
        spyOn(component.child, 'click').and.callFake(d => {
          id = d.data.id;
        });
        component.child.createChart();
        fixture.detectChanges();
        tick(TIME_TICK);
        expect(id).toEqual(MockSunburstData.children[0].id);
      })
    );
  });
});
