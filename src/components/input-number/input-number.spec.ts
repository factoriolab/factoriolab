import { ComponentFixture, TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { setInputs } from '~/tests/utils';

import { InputNumber } from './input-number';

describe('InputNumber', () => {
  let component: InputNumber;
  let fixture: ComponentFixture<InputNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputNumber],
    }).compileComponents();

    fixture = TestBed.createComponent(InputNumber);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('text', () => {
    it('should preserve the old text if the value is unchanged', () => {
      component['text'].set('01');
      component.value.set(rational(1n));
      expect(component['text']()).toEqual('01');
    });

    it('should change the text if the new value is not equal', () => {
      component['text'].set('01');
      component.value.set(rational(2n));
      expect(component['text']()).toEqual('2');
    });
  });

  describe('constructor', () => {
    it('should set up a subscription to the emit observable', () => {
      spyOn(component, 'setValue');
      component['valueChange'].next({ type: 'keydown', value: rational(2n) });
      expect(component.setValue).toHaveBeenCalledWith(rational(2n));
    });

    it('should round when configured as integer number', () => {
      setInputs(fixture, { integer: true });
      spyOn(component, 'setValue');
      component['valueChange'].next({
        type: 'keydown',
        value: rational(2n, 3n),
      });
      expect(component.setValue).toHaveBeenCalledWith(rational.one);
    });

    it('should debounce on input', () => {
      spyOn(component, 'setValue');
      component['valueChange'].next({
        type: 'input',
        value: rational(2n),
      });
      expect(component.setValue).not.toHaveBeenCalled();
    });
  });

  describe('valuesEqual', () => {
    it('should compare rational values', () => {
      expect(component.valuesEqual(rational(2n), rational(2n))).toBeTrue();
    });
  });

  describe('onChange', () => {
    it('should next the valueChange and set the text', () => {
      component['text'].set('123');
      spyOn(component['valueChange'], 'next');
      spyOn(component['text'], 'set');
      component.onChange(new KeyboardEvent('keydown'));
      expect(component['valueChange'].next).toHaveBeenCalledWith({
        type: 'keydown',
        value: rational(123n),
      });
      expect(component['text'].set).toHaveBeenCalledWith('123');
    });

    it('should return if value is empty and event is blur/keydown', () => {
      component['text'].set('');
      spyOn(component.valueReset, 'emit');
      component.onChange(new InputEvent('blur'));
      expect(component.valueReset.emit).toHaveBeenCalled();
    });
  });

  describe('increment', () => {
    it('should increment by addition', () => {
      spyOn(component['valueChange'], 'next');
      component.increment(1);
      expect(component['valueChange'].next).toHaveBeenCalledWith({
        type: 'keydown',
        value: rational.one,
      });
    });

    it('should decrement by addition', () => {
      spyOn(component['valueChange'], 'next');
      component.value.set(rational.one);
      component.increment(-1);
      expect(component['valueChange'].next).toHaveBeenCalledWith({
        type: 'keydown',
        value: rational.zero,
      });
    });

    it('should increment by multiplication', () => {
      setInputs(fixture, { step: rational(10n), stepType: 'multiply' });
      const spy = spyOn(component['valueChange'], 'next');
      component.increment(1);
      expect(spy).toHaveBeenCalledWith({
        type: 'keydown',
        value: rational(1n, 10n),
      });
      spy.calls.reset();
      component.value.set(rational.one);
      component.increment(1);
      expect(spy).toHaveBeenCalledWith({
        type: 'keydown',
        value: rational(10n),
      });
    });

    it('should decrement by division', () => {
      setInputs(fixture, {
        minimum: undefined,
        step: rational(10n),
        stepType: 'multiply',
      });
      const spy = spyOn(component['valueChange'], 'next');
      component.increment(-1);
      expect(spy).toHaveBeenCalledWith({
        type: 'keydown',
        value: rational(-1n, 10n),
      });
      spy.calls.reset();
      component.value.set(rational(-1n, 10n));
      component.increment(-1);
      expect(spy).toHaveBeenCalledWith({
        type: 'keydown',
        value: rational.zero,
      });
      spy.calls.reset();
      component.value.set(rational.one);
      component.increment(-1);
      expect(spy).toHaveBeenCalledWith({
        type: 'keydown',
        value: rational(1n, 10n),
      });
    });

    it('should enforce a minimum value', () => {
      spyOn(component['valueChange'], 'next');
      component.increment(-1);
      expect(component['valueChange'].next).toHaveBeenCalledWith({
        type: 'keydown',
        value: rational.zero,
      });
    });

    it('should enforce a maximum value', () => {
      setInputs(fixture, { maximum: rational.zero });
      spyOn(component['valueChange'], 'next');
      component.increment(1);
      expect(component['valueChange'].next).toHaveBeenCalledWith({
        type: 'keydown',
        value: rational.zero,
      });
    });
  });
});
