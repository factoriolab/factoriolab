import { ComponentFixture, TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { mockBeaconSettings } from '~/tests/mocks/settings';
import { TestModule } from '~/tests/test-module';

import { BeaconsSelect } from './beacons-select';

describe('BeaconsSelect', () => {
  let component: BeaconsSelect;
  let fixture: ComponentFixture<BeaconsSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, BeaconsSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(BeaconsSelect);
    component = fixture.componentInstance;
    component.value.set(mockBeaconSettings);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('open', () => {
    it('should reset the editValue', () => {
      spyOn(component['editValue'], 'set');
      component.open();
      expect(component['editValue'].set).toHaveBeenCalledWith(
        mockBeaconSettings,
      );
    });
  });

  describe('save', () => {
    it('should write the new value', () => {
      spyOn(component, 'setValue');
      component.save();
      expect(component.setValue).toHaveBeenCalledWith(mockBeaconSettings);
    });
  });

  describe('setField', () => {
    it('should update the signal', () => {
      component.setField(0, 'count', rational.zero);
      expect(component['editValue']()[0].count).toEqual(rational.zero);
    });
  });

  describe('removeEntry', () => {
    it('should update the signal', () => {
      component.removeEntry(0);
      expect(component['editValue']()).toEqual([mockBeaconSettings[1]]);
    });
  });

  describe('addEntry', () => {
    it('should update the signal', () => {
      component.addEntry();
      expect(component['editValue']()).toHaveSize(3);
    });
  });
});
