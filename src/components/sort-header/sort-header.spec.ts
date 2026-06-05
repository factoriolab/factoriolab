import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  faArrowDownWideShort,
  faArrowUpShortWide,
} from '@fortawesome/free-solid-svg-icons';

import { setInputs } from '~/tests/utils';

import { SortHeader } from './sort-header';

describe('SortHeader', () => {
  let component: SortHeader;
  let fixture: ComponentFixture<SortHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(SortHeader);
    setInputs(fixture, {
      text: '',
      column: 'col',
      state: {},
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('icon', () => {
    it('should return the icon based on the current sort state', () => {
      setInputs(fixture, { state: { sort: 'col', asc: true } });
      expect(component['icon']()).toEqual(faArrowUpShortWide);
      setInputs(fixture, { state: { sort: 'col', asc: false } });
      expect(component['icon']()).toEqual(faArrowDownWideShort);
    });
  });

  describe('nextSort', () => {
    it('should determine the next sorting state', () => {
      expect(component['nextSort']()).toEqual({ sort: 'col', asc: false });
      setInputs(fixture, { state: { sort: 'col', asc: false } });
      expect(component['nextSort']()).toEqual({ asc: true });
      setInputs(fixture, { state: { sort: 'col', asc: true } });
      expect(component['nextSort']()).toEqual({ sort: undefined, asc: false });
    });
  });

  describe('undoClicked', () => {
    it('should stop propagation and emit', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      spyOn(component.undo, 'emit');
      component['undoClicked'](event);
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.undo.emit).toHaveBeenCalled();
    });
  });
});
