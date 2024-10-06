import { ComponentFixture, TestBed } from '@angular/core/testing';

import { rational } from '~/models/rational';
import { ItemId, Mocks, RecipeId, TestModule } from '~/tests';

import { BeaconsOverlayComponent } from './beacons-overlay.component';

describe('BeaconsOverlayComponent', () => {
  let component: BeaconsOverlayComponent;
  let fixture: ComponentFixture<BeaconsOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, BeaconsOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BeaconsOverlayComponent);
    component = fixture.componentInstance;
    spyOn(component as any, '_show');
    component.show({} as any, Mocks.beaconSettings, RecipeId.AdvancedCircuit);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('show', () => {
    it('should show the overlay', () => {
      const event = {} as any;
      component.show(event, Mocks.beaconSettings, RecipeId.AdvancedCircuit);
      expect(component.beacons()).toEqual(Mocks.beaconSettings);
      expect(component.beacons()).not.toBe(Mocks.beaconSettings);
      expect(component.recipeId()).toEqual(RecipeId.AdvancedCircuit);
      expect(component['_show']).toHaveBeenCalledWith(event);
    });
  });

  describe('setCount', () => {
    it('should update the signal', () => {
      component.setCount(0, rational.zero);
      expect(component.beacons()[0].count).toEqual(rational.zero);
    });
  });

  describe('setId', () => {
    it('should update the signal and stop propagation', () => {
      const originalEvent = { stopPropagation: (): void => {} };
      const value = ItemId.CargoWagon;
      spyOn(originalEvent, 'stopPropagation');
      component.setId(0, { originalEvent, value } as any);
      expect(originalEvent.stopPropagation).toHaveBeenCalled();
      expect(component.beacons()[0].id).toEqual(ItemId.CargoWagon);
    });
  });

  describe('setModules', () => {
    it('should update the signal', () => {
      component.setModules(0, []);
      expect(component.beacons()[0].modules).toEqual([]);
    });
  });

  describe('setTotal', () => {
    it('should update the signal', () => {
      component.setTotal(0, rational.one);
      expect(component.beacons()[0].total).toEqual(rational.one);
    });
  });

  describe('removeEntry', () => {
    it('should update the signal', () => {
      component.removeEntry(0);
      expect(component.beacons()).toEqual([]);
    });
  });

  describe('addEntry', () => {
    it('should update the signal', () => {
      component.addEntry();
      expect(component.beacons()).toHaveSize(2);
    });
  });

  describe('save', () => {
    it('should emit the new value', () => {
      spyOn(component.setValue, 'emit');
      component.save();
      expect(component.setValue.emit).toHaveBeenCalledWith(
        Mocks.beaconSettings,
      );
    });
  });
});
