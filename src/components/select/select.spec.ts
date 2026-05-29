import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { setInputs } from '~/tests/utils';

import { Select } from './select';

describe('Select', () => {
  let component: Select;
  let fixture: ComponentFixture<Select>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Select],
    }).compileComponents();

    fixture = TestBed.createComponent(Select);
    setInputs(fixture, {
      options: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
      ],
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selection', () => {
    it('should generate a set from the selection', () => {
      expect(component['selection']()).toEqual(new Set());
    });
  });

  describe('filter', () => {
    it('should hide the filter if 10 or less options', () => {
      expect(component['filter']()).toBeFalse();
    });
  });

  describe('multi', () => {
    it('should determine whether the selection is array-like', () => {
      expect(component['multi']()).toBeFalse();
    });
  });

  describe('allSelected', () => {
    it('should determine whether all items are selected', () => {
      expect(component['allSelected']()).toBeFalse();
      setInputs(fixture, { value: new Set([1, 2]) });
      expect(component['allSelected']()).toBeTrue();
      setInputs(fixture, { value: new Set([1]) });
      expect(component['allSelected']()).toBeUndefined();
    });
  });

  describe('filterLower', () => {
    it('should lowercase the filter text', () => {
      component['filterText'].set('FILTER');
      expect(component['filterLower']()).toEqual('filter');
    });
  });

  describe('toggle', () => {
    it('should open the overlay', () => {
      spyOn(component['filterText'], 'set');
      spyOn(component['selection'], 'set');
      spyOn<any>(component, 'focusAfterOpen');
      component.toggle();
      expect(component.opened()).toBeTrue();
      expect(component['filterText'].set).toHaveBeenCalledWith('');
      expect(component['selection'].set).toHaveBeenCalledWith(new Set());
      expect(component['focusAfterOpen']).toHaveBeenCalled();
    });

    it('should close the overlay and call setValue with a set', async () => {
      component.opened.set(true);
      setInputs(fixture, { value: new Set() });
      component['selection'].set(new Set([1]));
      spyOn(component, 'setValue');
      component.toggle();
      await TestBed.inject(ApplicationRef).whenStable();
      expect(component.opened()).toBeFalse();
      expect(component.setValue).toHaveBeenCalledWith(new Set([1]));
    });

    it('should close the overlay and call setValue with an array', async () => {
      component.opened.set(true);
      setInputs(fixture, { value: [] });
      component['selection'].set(new Set([1]));
      spyOn(component, 'setValue');
      component.toggle();
      await TestBed.inject(ApplicationRef).whenStable();
      expect(component.opened()).toBeFalse();
      expect(component.setValue).toHaveBeenCalledWith([1]);
    });

    it('should not open the overlay if disabled or unmatched KeyboardEvent', () => {
      component.toggle(new KeyboardEvent('keydown'));
      expect(component.opened()).toBeFalse();
      component.disabled.set(true);
      component.toggle();
      expect(component.opened()).toBeFalse();
    });
  });

  describe('select', () => {
    it('should add to, and remove from, a selection set', () => {
      setInputs(fixture, { value: [] });
      component.select(1);
      expect(component['selection']()).toContain(1);
      component.select(1);
      expect(component['selection']()).not.toContain(1);
    });

    it('should toggle the overlay and set the value in single selection mode', () => {
      spyOn(component, 'toggle');
      spyOn(component, 'setValue');
      component.select(1);
      expect(component.toggle).toHaveBeenCalled();
      expect(component.setValue).toHaveBeenCalledWith(1);
    });
  });

  describe('selectAll', () => {
    it('should select and deselect all options', () => {
      setInputs(fixture, { value: [] });
      component.selectAll(true);
      expect(component['selection']()).toEqual(new Set([1, 2]));
      component.selectAll(false);
      expect(component['selection']()).toEqual(new Set());
    });

    it('should do nothing if in single select mode or passing undefined', () => {
      spyOn(component['selection'], 'set');
      component.selectAll(true);
      expect(component['selection'].set).not.toHaveBeenCalled();
      setInputs(fixture, { value: [] });
      component.selectAll(undefined);
      expect(component['selection'].set).not.toHaveBeenCalled();
    });
  });

  describe('focusFirst', () => {
    it('should focus the first list item', () => {
      const event = { preventDefault: (): void => {} };
      const el = { nativeElement: { focus: (): void => {} } };
      spyOn(event, 'preventDefault');
      spyOn(el.nativeElement, 'focus');
      spyOn<any>(component, 'listItems').and.returnValue([el, {}]);
      component.focusFirst(event as any);
      expect(el.nativeElement.focus).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should return if no item is found', () => {
      const event = { preventDefault: (): void => {} };
      spyOn(event, 'preventDefault');
      spyOn<any>(component, 'listItems').and.returnValue([]);
      component.focusFirst(event as any);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('focusLast', () => {
    it('should focus the last list item', () => {
      const event = { preventDefault: (): void => {} };
      const el = { nativeElement: { focus: (): void => {} } };
      spyOn(event, 'preventDefault');
      spyOn(el.nativeElement, 'focus');
      spyOn<any>(component, 'listItems').and.returnValue([{}, el]);
      component.focusLast(event as any);
      expect(el.nativeElement.focus).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should return if no item is found', () => {
      const event = { preventDefault: (): void => {} };
      spyOn(event, 'preventDefault');
      spyOn<any>(component, 'listItems').and.returnValue([]);
      component.focusLast(event as any);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('focusMove', () => {
    it('should focus the next list item', () => {
      const current = { nativeElement: {} };
      const event = { preventDefault: (): void => {} };
      const next = { nativeElement: { focus: (): void => {} } };
      spyOn(event, 'preventDefault');
      spyOn(next.nativeElement, 'focus');
      spyOn<any>(component, 'listItems').and.returnValue([current, next]);
      component.focusMove(current.nativeElement as any, 1, event as any);
      expect(next.nativeElement.focus).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should return if no item is found', () => {
      const event = { preventDefault: (): void => {} };
      spyOn(event, 'preventDefault');
      spyOn<any>(component, 'listItems').and.returnValue([]);
      component.focusMove({} as any, 1, event as any);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('focusAfterOpen', () => {
    let el: {
      nativeElement: { focus: () => void; scrollIntoView: () => void };
    };

    beforeEach(() => {
      el = {
        nativeElement: {
          focus: (): void => {},
          scrollIntoView: (): void => {},
        },
      };
      spyOn(el.nativeElement, 'focus');
      spyOn(el.nativeElement, 'scrollIntoView');
    });

    it('should focus using ArrowUp', async () => {
      spyOn<any>(component, 'listItems').and.returnValue([el, {}]);
      component.value.set(2);
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      component['focusAfterOpen'](event);
      await TestBed.inject(ApplicationRef).whenStable();
      expect(el.nativeElement.focus).toHaveBeenCalled();
      expect(el.nativeElement.scrollIntoView).toHaveBeenCalled();
    });

    it('should focus using ArrowDown', async () => {
      spyOn<any>(component, 'listItems').and.returnValue([{}, el]);
      component.value.set(1);
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      component['focusAfterOpen'](event);
      await TestBed.inject(ApplicationRef).whenStable();
      expect(el.nativeElement.focus).toHaveBeenCalled();
      expect(el.nativeElement.scrollIntoView).toHaveBeenCalled();
    });

    it('should focus using Home', async () => {
      spyOn<any>(component, 'listItems').and.returnValue([el, {}]);
      const event = new KeyboardEvent('keydown', { key: 'Home' });
      component['focusAfterOpen'](event);
      await TestBed.inject(ApplicationRef).whenStable();
      expect(el.nativeElement.focus).toHaveBeenCalled();
      expect(el.nativeElement.scrollIntoView).toHaveBeenCalled();
    });

    it('should focus using End', async () => {
      spyOn<any>(component, 'listItems').and.returnValue([{}, el]);
      const event = new KeyboardEvent('keydown', { key: 'End' });
      component['focusAfterOpen'](event);
      await TestBed.inject(ApplicationRef).whenStable();
      expect(el.nativeElement.focus).toHaveBeenCalled();
      expect(el.nativeElement.scrollIntoView).toHaveBeenCalled();
    });

    it('should handle not finding the index to focus', async () => {
      spyOn<any>(component, 'listItems').and.returnValue([null, el]);
      const event = new KeyboardEvent('keydown', { key: 'Home' });
      component['focusAfterOpen'](event);
      await TestBed.inject(ApplicationRef).whenStable();
      expect(el.nativeElement.focus).not.toHaveBeenCalled();
      expect(el.nativeElement.scrollIntoView).not.toHaveBeenCalled();
    });

    it('should find the correct index in multiselect mode', async () => {
      spyOn<any>(component, 'listItems').and.returnValue([{}, el]);
      setInputs(fixture, { value: [] });
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      component['focusAfterOpen'](event);
      await TestBed.inject(ApplicationRef).whenStable();
      expect(el.nativeElement.focus).toHaveBeenCalled();
      expect(el.nativeElement.scrollIntoView).toHaveBeenCalled();
    });
  });
});
