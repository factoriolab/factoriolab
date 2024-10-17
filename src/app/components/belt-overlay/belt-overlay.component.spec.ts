import { ComponentFixture, TestBed } from '@angular/core/testing';

import { rational } from '~/models/rational';
import { ItemId, Mocks, TestModule } from '~/tests';

import { BeltOverlayComponent } from './belt-overlay.component';

describe('BeltOverlayComponent', () => {
  let component: BeltOverlayComponent;
  let fixture: ComponentFixture<BeltOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, BeltOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BeltOverlayComponent);
    component = fixture.componentInstance;
    spyOn(component as any, '_show');
    component.show({} as any, Mocks.itemsStateInitial[ItemId.Coal], 'belt');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('show', () => {
    it('should show the overlay', () => {
      const event = {} as any;
      component.show(event, Mocks.itemsStateInitial[ItemId.Coal], 'belt');
      expect(component.settings()).toEqual(
        Mocks.itemsStateInitial[ItemId.Coal],
      );
      expect(component.type()).toEqual('belt');
      expect(component['_show']).toHaveBeenCalledWith(event);
    });
  });

  describe('setStack', () => {
    it('should update the signal', () => {
      component.setStack(rational.zero);
      expect(component.settings()?.stack).toEqual(rational.zero);
    });
  });

  describe('setBelt', () => {
    it('should update the signal', () => {
      component.setBelt(ItemId.TransportBelt);
      expect(component.settings()?.beltId).toEqual(ItemId.TransportBelt);
    });
  });

  describe('save', () => {
    it('should return if no value was ever set up', () => {
      spyOn(component.setValue, 'emit');
      component.settings.set(undefined);
      component.save();
      expect(component.setValue.emit).not.toHaveBeenCalled();
    });

    it('should emit the new value', () => {
      spyOn(component.setValue, 'emit');
      component.save();
      expect(component.setValue.emit).toHaveBeenCalledWith(
        Mocks.itemsStateInitial[ItemId.Coal],
      );
    });
  });
});
