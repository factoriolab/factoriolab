import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestModule } from 'src/tests';
import { AppSharedModule } from '~/app-shared.module';
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

  describe('rebuildChart', () => {
    it('should build the chart from flow data', () => {
      const promise = Promise.resolve({
        children: [{ id: 'a', x: 1, y: 2 }],
      } as any);
      spyOn(component, 'getElk').and.returnValue({
        layout: () => promise,
      } as any);
      component.rebuildChart(Mocks.Flow, Mocks.PreferencesState);
      expect(component.getElk).toHaveBeenCalled();
    });

    it('should handle null elk layout', () => {
      const promise = Promise.resolve({
        children: null,
      } as any);
      spyOn(component, 'getElk').and.returnValue({
        layout: () => promise,
      } as any);
      component.rebuildChart(Mocks.Flow, Mocks.PreferencesState);
      expect(component.getElk).toHaveBeenCalled();
    });
  });
});
