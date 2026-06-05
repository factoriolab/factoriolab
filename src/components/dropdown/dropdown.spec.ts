import { ComponentFixture, TestBed } from '@angular/core/testing';

import { setInputs } from '~/tests/utils';

import { Dropdown } from './dropdown';

describe('Dropdown', () => {
  let component: Dropdown;
  let fixture: ComponentFixture<Dropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dropdown],
    }).compileComponents();

    fixture = TestBed.createComponent(Dropdown);
    setInputs(fixture, { controlId: 'id' });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggle', () => {
    it('should open the dropdown', () => {
      spyOn(component.open, 'emit');
      component.toggle();
      expect(component['opened']()).toBeTrue();
      expect(component.open.emit).toHaveBeenCalled();
    });

    it('should close the dropdown', () => {
      component['opened'].set(true);
      spyOn(component.save, 'emit');
      component.toggle();
      expect(component['opened']()).toBeFalse();
      expect(component.save.emit).toHaveBeenCalled();
    });

    it('should return if disabled', () => {
      setInputs(fixture, { disabled: true });
      component.toggle();
      expect(component['opened']()).toBeFalse();
    });
  });
});
