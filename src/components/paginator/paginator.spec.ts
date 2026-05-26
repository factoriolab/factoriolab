import { ComponentFixture, TestBed } from '@angular/core/testing';

import { setInputs } from '~/tests/utils';

import { Paginator } from './paginator';

describe('Paginator', () => {
  let component: Paginator;
  let fixture: ComponentFixture<Paginator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paginator],
    }).compileComponents();

    fixture = TestBed.createComponent(Paginator);
    setInputs(fixture, { state: { rows: 2, page: 1, asc: false }, total: 5 });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('pageOptions', () => {
    it('should max at five', () => {
      setInputs(fixture, {
        state: { rows: 2, page: 1, asc: false },
        total: 50,
      });
      expect(component['pageOptions']()).toHaveSize(5);
    });
  });

  describe('goToButton', () => {
    it('should update the page', () => {
      component.goToButton('last');
      expect(component.state()).toEqual({ page: 2, rows: 2, asc: false });
    });
  });

  describe('getPage', () => {
    it('should get the page based on context and which button', () => {
      expect(component['getPage'](0, 2, 5, 'first')).toEqual(0);
      expect(component['getPage'](1, 2, 10, 'previous')).toEqual(0);
      expect(component['getPage'](0, 2, 5, 'next')).toEqual(1);
      expect(component['getPage'](0, 2, 5, 'last')).toEqual(2);
    });
  });
});
