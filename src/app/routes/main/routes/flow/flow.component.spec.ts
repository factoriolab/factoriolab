import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestModule } from 'src/tests';
import { AppSharedModule } from '~/app-shared.module';
import {
  SankeyAlign,
  sankeyCenter,
  sankeyJustify,
  sankeyLeft,
  sankeyRight,
} from '~/models';
import { FlowComponent } from './flow.component';

describe('FlowComponent', () => {
  let component: FlowComponent;
  let fixture: ComponentFixture<FlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, AppSharedModule, FlowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rebuildBoxLine', () => {
    it('should build the chart from flow data', () => {
      const promise = Promise.resolve({
        children: [{ id: 'a', x: 1, y: 2 }],
      } as any);
      spyOn(component, 'getElk').and.returnValue({
        layout: () => promise,
      } as any);
      component.rebuildBoxLine(Mocks.Flow);
      expect(component.getElk).toHaveBeenCalled();
    });

    it('should handle null elk layout', () => {
      const promise = Promise.resolve({
        children: null,
      } as any);
      spyOn(component, 'getElk').and.returnValue({
        layout: () => promise,
      } as any);
      component.rebuildBoxLine(Mocks.Flow);
      expect(component.getElk).toHaveBeenCalled();
    });
  });

  describe('getElk', () => {
    it('should create', () => {
      expect(component.getElk()).toBeTruthy();
    });
  });

  describe('foreColor', () => {
    it('should return appropriate color for background', () => {
      expect(component.foreColor('#000000')).toEqual('#fff');
      expect(component.foreColor('#ffffff')).toEqual('#000');
    });
  });

  describe('getAlign', () => {
    it('should return the proper sankey alignment function', () => {
      expect(component.getAlign(SankeyAlign.Justify)).toEqual(sankeyJustify);
      expect(component.getAlign(SankeyAlign.Left)).toEqual(sankeyLeft);
      expect(component.getAlign(SankeyAlign.Right)).toEqual(sankeyRight);
      expect(component.getAlign(SankeyAlign.Center)).toEqual(sankeyCenter);
    });
  });

  describe('nodeHeight', () => {
    it('should handle valid or nullish values', () => {
      const valid: any = { y1: 5, y0: 0 };
      const invalid: any = {};
      expect(component.nodeHeight(valid)).toEqual(5);
      expect(component.nodeHeight(invalid)).toEqual(0);
    });
  });
});
