import { STANDARD_DROPDOWN_ADJACENT_POSITIONS } from '@angular/cdk/overlay';
import { ApplicationRef, Component, input, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY, Observable, of } from 'rxjs';

import { setInputs } from '~/tests/utils';

import { Tooltip } from './tooltip';

@Component({
  imports: [Tooltip],
  template: `
    <div
      [labTooltip]="labTooltip()"
      [labTooltipPosition]="labTooltipPosition()"
      [labTooltipDisabled]="labTooltipDisabled()"
    ></div>
  `,
})
export class TestTooltip {
  tooltip = viewChild.required(Tooltip);
  labTooltip = input<string>('labTooltip');
  labTooltipPosition = input<'below' | 'adjacent'>('below');
  labTooltipDisabled = input<boolean>();
}

describe('Tooltip', () => {
  let component: TestTooltip;
  let fixture: ComponentFixture<TestTooltip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTooltip],
    }).compileComponents();

    fixture = TestBed.createComponent(TestTooltip);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should set up an effect that hides the tooltip when disabled', () => {
      spyOn(component.tooltip(), 'hide');
      setInputs(fixture, { labTooltipDisabled: true });
      expect(component.tooltip().hide).toHaveBeenCalled();
    });
  });

  describe('show', () => {
    it('should create the overlay and hide if clicked outside', async () => {
      const ref = {
        outsidePointerEvents: (): Observable<any> => of({ type: 'click' }),
        attach: (): void => {},
        updatePosition: (): void => {},
      };
      spyOn(component.tooltip()['overlay'], 'create').and.returnValue(
        ref as any,
      );
      spyOn(ref, 'attach');
      spyOn(ref, 'updatePosition');
      spyOn(component.tooltip(), 'hide');
      component.tooltip().show();
      expect(component.tooltip().hide).toHaveBeenCalled();
      expect(ref.attach).toHaveBeenCalled();
      await TestBed.inject(ApplicationRef).whenStable();
      expect(ref.updatePosition).toHaveBeenCalled();
    });

    it('should return if disabled', () => {
      setInputs(fixture, { labTooltipDisabled: true });
      spyOn(component.tooltip(), 'labTooltip');
      component.tooltip().show();
      expect(component.tooltip().labTooltip).not.toHaveBeenCalled();
    });

    it('should return if tooltip has no value', () => {
      setInputs(fixture, { labTooltip: '' });
      spyOn(component.tooltip(), 'labTooltipPosition');
      component.tooltip().show();
      expect(component.tooltip().labTooltipPosition).not.toHaveBeenCalled();
    });

    it('should use adjacent positions if specified', async () => {
      const ref = {
        outsidePointerEvents: (): Observable<any> => of({ type: 'click' }),
        attach: (): void => {},
        updatePosition: (): void => {},
      };
      spyOn(component.tooltip()['overlay'], 'create').and.returnValue(
        ref as any,
      );
      const positionStrategy = {
        withPositions: (_positions: any): any => ({ positionChanges: EMPTY }),
      };
      spyOn(positionStrategy, 'withPositions').and.callThrough();
      spyOn(component.tooltip()['overlay'], 'position').and.returnValue({
        flexibleConnectedTo: (): any => ({
          withFlexibleDimensions: (): any => positionStrategy,
        }),
      } as any);
      spyOn(ref, 'attach');
      spyOn(ref, 'updatePosition');
      spyOn(component.tooltip(), 'hide');
      setInputs(fixture, { labTooltipPosition: 'adjacent' });
      component.tooltip().show();
      expect(component.tooltip().hide).toHaveBeenCalled();
      expect(ref.attach).toHaveBeenCalled();
      expect(positionStrategy.withPositions).toHaveBeenCalledWith(
        STANDARD_DROPDOWN_ADJACENT_POSITIONS,
      );
      await TestBed.inject(ApplicationRef).whenStable();
      expect(ref.updatePosition).toHaveBeenCalled();
    });
  });

  describe('enter', () => {
    it('should show the tooltip unless on mobile', () => {
      spyOn(component.tooltip(), 'show');
      component.tooltip().enter();
      expect(component.tooltip().show).toHaveBeenCalled();
      component.tooltip()['platform'].ANDROID = true;
      component.tooltip().enter();
      expect(component.tooltip().show).toHaveBeenCalledTimes(1);
    });
  });

  describe('touch', () => {
    it('should show after holding touch for 500ms', () => {
      let fn = (): void => {};
      spyOn(window, 'setTimeout').and.callFake((val) => {
        fn = val as unknown as () => void;
        return 1;
      });
      spyOn(component.tooltip(), 'show');
      component.tooltip().touch();
      expect(component.tooltip()['touchTimer']).toEqual(1);
      fn();
      expect(component.tooltip().show).toHaveBeenCalled();
      expect(component.tooltip()['touchTimer']).toBeUndefined();
    });
  });

  describe('cancelTouch', () => {
    it('should call to cancel the timer', () => {
      component.tooltip()['touchTimer'] = 1;
      spyOn(window, 'clearTimeout');
      component.tooltip().cancelTouch();
      expect(window.clearTimeout).toHaveBeenCalledWith(1);
    });
  });

  describe('hide', () => {
    it('should dispose of the overlayRef', () => {
      const ref = {
        dispose: (): void => {},
      };
      spyOn(ref, 'dispose');
      component.tooltip()['overlayRef'] = ref as any;
      component.tooltip().hide();
      expect(ref.dispose).toHaveBeenCalled();
      expect(component.tooltip()['overlayRef']).toBeUndefined();
    });
  });
});
