import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { Tabs } from './tabs';

describe('Tabs', () => {
  let component: Tabs;
  let fixture: ComponentFixture<Tabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Tabs],
    }).compileComponents();

    fixture = TestBed.createComponent(Tabs);
    setInputs(fixture, {
      value: '2',
      tabs: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
      ],
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('indicatorStyle', () => {
    it('should return styles for the indicator bar positioning', () => {
      expect(component.indicatorStyle()).toBeTruthy();
    });

    it('should return null if no tabs are present', () => {
      setInputs(fixture, { tabs: [] });
      expect(component.indicatorStyle()).toBeUndefined();
    });
  });

  describe('scrollNext', () => {
    it('should set the scrollLeft property', () => {
      const el = { scrollLeft: 0, offsetWidth: 10 };
      component.scrollNext(el as any, 1);
      expect(el.scrollLeft).toEqual(8);
    });
  });

  describe('onScrollEnd', () => {
    it('should call to check changes after the next render', () => {
      spyOn<any>(component, 'checkAfterRender');
      component.onScrollEnd();
      expect(component['checkAfterRender']).toHaveBeenCalled();
    });
  });

  describe('select', () => {
    it('should call to setValue and execute any tab command', () => {
      spyOn(component, 'setValue');
      const tab = { value: 1, command: (): void => {} };
      spyOn(tab, 'command');
      component.select(tab as any);
      expect(component.setValue).toHaveBeenCalledWith(1 as any);
      expect(tab.command).toHaveBeenCalled();
    });
  });

  describe('onKeydown', () => {
    it('should handle various KeyboardEvents', () => {
      spyOn(component, 'focusMove');
      spyOn(component, 'focusFirst');
      spyOn(component, 'focusLast');
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(component.focusMove).toHaveBeenCalled();
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(component.focusMove).toHaveBeenCalledTimes(2);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'Home' }));
      expect(component.focusFirst).toHaveBeenCalled();
      component.onKeydown(new KeyboardEvent('keydown', { key: 'End' }));
      expect(component.focusLast).toHaveBeenCalled();
    });
  });

  describe('focusFirst', () => {
    it('should focus on the first tab element', () => {
      const el = {
        nativeElement: {
          click: (): void => {},
          scrollIntoView: (): void => {},
        },
      };
      spyOn(el.nativeElement, 'click');
      spyOn(el.nativeElement, 'scrollIntoView');
      const event = new KeyboardEvent('keydown');
      spyOn(event, 'preventDefault');
      spyOn<any>(component, 'tabElements').and.returnValue([el, {}]);
      component.focusFirst(event);
      expect(el.nativeElement.click).toHaveBeenCalled();
      expect(el.nativeElement.scrollIntoView).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should exit if no elements are found', () => {
      const event = new KeyboardEvent('keydown');
      spyOn(event, 'preventDefault');
      spyOn<any>(component, 'tabElements').and.returnValue([]);
      component.focusFirst(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('focusLast', () => {
    it('should focus on the last tab element', () => {
      const el = {
        nativeElement: {
          click: (): void => {},
          scrollIntoView: (): void => {},
        },
      };
      spyOn(el.nativeElement, 'click');
      spyOn(el.nativeElement, 'scrollIntoView');
      const event = new KeyboardEvent('keydown');
      spyOn(event, 'preventDefault');
      spyOn<any>(component, 'tabElements').and.returnValue([{}, el]);
      component.focusLast(event);
      expect(el.nativeElement.click).toHaveBeenCalled();
      expect(el.nativeElement.scrollIntoView).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should exit if no elements are found', () => {
      const event = new KeyboardEvent('keydown');
      spyOn(event, 'preventDefault');
      spyOn<any>(component, 'tabElements').and.returnValue([]);
      component.focusLast(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('focusMove', () => {
    it('should move focus to the next tab element', () => {
      component.setValue('id');
      spyOn<any>(component, 'tabs').and.returnValue([{ value: 'id' }]);
      const el = {
        nativeElement: {
          click: (): void => {},
          scrollIntoView: (): void => {},
        },
      };
      spyOn(el.nativeElement, 'click');
      spyOn(el.nativeElement, 'scrollIntoView');
      const event = new KeyboardEvent('keydown');
      spyOn(event, 'preventDefault');
      spyOn<any>(component, 'tabElements').and.returnValue([{}, el]);
      component.focusMove(1, event);
      expect(el.nativeElement.click).toHaveBeenCalled();
      expect(el.nativeElement.scrollIntoView).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should exit if no elements are found', () => {
      const event = new KeyboardEvent('keydown');
      spyOn(event, 'preventDefault');
      spyOn<any>(component, 'tabElements').and.returnValue([]);
      component.focusMove(1, event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });
});
