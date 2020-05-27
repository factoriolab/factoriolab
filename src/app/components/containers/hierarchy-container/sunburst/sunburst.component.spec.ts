import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import * as Mocks from 'src/mocks';
import { SunburstComponent } from './sunburst.component';

@Component({
  selector: 'lab-test-sunburst',
  template: ` <lab-sunburst
    [data]="data"
    (setNode)="setNode($event)"
    (setPath)="setPath($event)"
  >
  </lab-sunburst>`,
})
class TestSunburstComponent {
  @ViewChild(SunburstComponent) child: SunburstComponent;

  data = Mocks.Root;
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
});
