import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { setInputs } from '~/tests/utils';

import { RankSelect } from './rank-select';

describe('RankSelect', () => {
  let component: RankSelect;
  let fixture: ComponentFixture<RankSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(RankSelect);
    setInputs(fixture, {
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
      ],
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('allSelected', () => {
    it('should determine checkbox value based on editValue', () => {
      expect(component['allSelected']()).toBeFalse();
      component['editValue'].set(['1', '2']);
      expect(component['allSelected']()).toBeTrue();
      component['editValue'].set(['1']);
      expect(component['allSelected']()).toBeUndefined();
    });
  });

  describe('filterLower', () => {
    it('should convert the filter to lowercase for comparison purposes', () => {
      component['filterText'].set('TEST');
      expect(component['filterLower']()).toEqual('test');
    });
  });

  describe('toggle', () => {
    it('should open the overlay', () => {
      spyOn(component['opened'], 'set');
      spyOn(component['filterText'], 'set');
      spyOn(component['editValue'], 'set');
      spyOn<any>(component, 'focusAfterOpen');
      component.toggle();
      expect(component['opened'].set).toHaveBeenCalledWith(true);
      expect(component['filterText'].set).toHaveBeenCalledWith('');
      expect(component['editValue'].set).toHaveBeenCalledWith([]);
      expect(component['focusAfterOpen']).toHaveBeenCalled();
    });

    it('should close the overlay and save the value', () => {
      component['opened'].set(true);
      component['editValue'].set(['id']);
      spyOn(component['opened'], 'set');
      spyOn(component, 'setValue');
      component.toggle();
      expect(component['opened'].set).toHaveBeenCalledWith(false);
      expect(component.setValue).toHaveBeenCalledWith(['id']);
    });

    it('should not open the overlay if disabled', () => {
      component.disabled.set(true);
      spyOn(component['opened'], 'set');
      component.toggle();
      expect(component['opened'].set).not.toHaveBeenCalled();
    });

    it('should not open the overlay if dragging', () => {
      component['dragging'].set(true);
      spyOn(component['opened'], 'set');
      component.toggle();
      expect(component['opened'].set).not.toHaveBeenCalled();
    });

    it('should not open the overlay on unmatched keyboard events', () => {
      spyOn(component['opened'], 'set');
      component.toggle(new KeyboardEvent(''));
      expect(component['opened'].set).not.toHaveBeenCalled();
    });
  });

  describe('select', () => {
    it('should add to the editValue', () => {
      component.select('id');
      expect(component['editValue']()).toEqual(['id']);
    });

    it('should remove from the editValue', () => {
      component['editValue'].set(['id']);
      component.select('id');
      expect(component['editValue']()).toEqual([]);
    });
  });

  describe('selectAll', () => {
    it('should select all options', () => {
      component.selectAll(true);
      expect(component['editValue']()).toEqual(['1', '2']);
    });

    it('should deselect all options', () => {
      component['editValue'].set(['id']);
      component.selectAll(false);
      expect(component['editValue']()).toEqual([]);
    });
  });

  describe('drop', () => {
    it('should reorder entries in the editValue', () => {
      component['editValue'].set(['1', '2']);
      component.drop({ previousIndex: 0, currentIndex: 1 } as any);
      expect(component['editValue']()).toEqual(['2', '1']);
    });
  });

  describe('focusFirst', () => {
    it('should focus the first item and prevent default', () => {
      const el = { nativeElement: { focus: (): void => {} } };
      spyOn(el.nativeElement, 'focus');
      spyOn<any>(component, 'listItems').and.returnValue([el]);
      const evt = new Event('click');
      spyOn(evt, 'preventDefault');
      component.focusFirst(evt);
      expect(el.nativeElement.focus).toHaveBeenCalled();
      expect(evt.preventDefault).toHaveBeenCalled();
    });

    it('should return if no list items are found', () => {
      const evt = new Event('click');
      spyOn(evt, 'preventDefault');
      component.focusFirst(evt);
      expect(evt.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('focusLast', () => {
    it('should focus the last item and prevent default', () => {
      const el = { nativeElement: { focus: (): void => {} } };
      spyOn(el.nativeElement, 'focus');
      spyOn<any>(component, 'listItems').and.returnValue([el]);
      const evt = new Event('click');
      spyOn(evt, 'preventDefault');
      component.focusLast(evt);
      expect(el.nativeElement.focus).toHaveBeenCalled();
      expect(evt.preventDefault).toHaveBeenCalled();
    });

    it('should return if no list items are found', () => {
      const evt = new Event('click');
      spyOn(evt, 'preventDefault');
      component.focusLast(evt);
      expect(evt.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('focusMove', () => {
    it('should move focus in the direction specified', () => {
      const first = { nativeElement: { focus: (): void => {} } };
      const second = { nativeElement: { focus: (): void => {} } };
      spyOn(second.nativeElement, 'focus');
      spyOn<any>(component, 'listItems').and.returnValue([first, second]);
      const evt = new Event('click');
      spyOn(evt, 'preventDefault');
      component.focusMove(first.nativeElement as any, 1, evt);
      expect(second.nativeElement.focus).toHaveBeenCalled();
      expect(evt.preventDefault).toHaveBeenCalled();
    });

    it('should return if no list items are found', () => {
      const evt = new Event('click');
      spyOn(evt, 'preventDefault');
      component.focusMove(null as any, 1, evt);
      expect(evt.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('focusAfterOpen', () => {
    it('should focus the first element after render', async () => {
      const el = {
        nativeElement: {
          focus: (): void => {},
          scrollIntoView: (): void => {},
        },
      };
      spyOn(el.nativeElement, 'focus');
      spyOn(el.nativeElement, 'scrollIntoView');
      spyOn<any>(component, 'listItems').and.returnValue([el]);
      component['focusAfterOpen']();
      await TestBed.inject(ApplicationRef).whenStable();
      expect(el.nativeElement.focus).toHaveBeenCalled();
      expect(el.nativeElement.scrollIntoView).toHaveBeenCalled();
    });

    it('should return if no list items are found', async () => {
      const spy = spyOn<any>(component, 'listItems').and.returnValue([]);
      component['focusAfterOpen']();
      await TestBed.inject(ApplicationRef).whenStable();
      expect(spy).toHaveBeenCalled();
    });
  });
});
