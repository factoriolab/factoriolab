import { Component, EventEmitter, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemId, Mocks } from 'src/tests';
import { DefaultIdPayload } from '~/models';
import { RecipeSettingsComponent } from './recipe-settings.component';

@Component({
  selector: 'lab-test-recipe-settings',
  template: `
    <lab-recipe-settings
      [data]="data"
      [recipeSettings]="recipeSettings"
      [factories]="factories"
    >
    </lab-recipe-settings>
  `,
})
class TestRecipeSettingsComponent {
  @ViewChild(RecipeSettingsComponent) child: RecipeSettingsComponent;
  data = Mocks.Data;
  recipeSettings = Mocks.RecipeSettingsInitial;
  factories = Mocks.FactorySettingsInitial;
}

describe('RecipeSettingsComponent', () => {
  let component: TestRecipeSettingsComponent;
  let fixture: ComponentFixture<TestRecipeSettingsComponent>;
  const id = 'id';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecipeSettingsComponent, TestRecipeSettingsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestRecipeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('getSettings', () => {
    it('should get the factory settings for a step', () => {
      expect(component.child.getSettings(Mocks.Step1.recipeId)).toEqual(
        component.factories.entities[
          component.recipeSettings[Mocks.Step1.recipeId].factory
        ]
      );
    });
  });

  describe('changeFactory', () => {
    it('should set a factory', () => {
      const emitter = new EventEmitter<DefaultIdPayload>();
      spyOn(emitter, 'emit');
      component.child.changeFactory(
        Mocks.Step1.recipeId,
        ItemId.AssemblingMachine1,
        emitter,
        id
      );
      expect(emitter.emit).toHaveBeenCalledWith({
        id,
        value: ItemId.AssemblingMachine1,
        default: ItemId.AssemblingMachine3,
      });
    });

    it('should use recipe id as default id', () => {
      const emitter = new EventEmitter<DefaultIdPayload>();
      spyOn(emitter, 'emit');
      component.child.changeFactory(
        Mocks.Step1.recipeId,
        ItemId.AssemblingMachine1,
        emitter
      );
      expect(emitter.emit).toHaveBeenCalledWith({
        id: Mocks.Step1.recipeId,
        value: ItemId.AssemblingMachine1,
        default: ItemId.AssemblingMachine3,
      });
    });
  });

  describe('changeFactoryModules', () => {
    it('should set factory modules', () => {
      const emitter = new EventEmitter<DefaultIdPayload<string[]>>();
      spyOn(emitter, 'emit');
      component.child.changeFactoryModules(
        Mocks.Step1.recipeId,
        ItemId.SpeedModule,
        0,
        emitter,
        id
      );
      expect(emitter.emit).toHaveBeenCalledWith({
        id,
        value: new Array(4).fill(ItemId.SpeedModule),
        default: new Array(4).fill(ItemId.SpeedModule3),
      });
    });

    it('should use recipe id as default id', () => {
      const emitter = new EventEmitter<DefaultIdPayload<string[]>>();
      spyOn(emitter, 'emit');
      component.child.changeFactoryModules(
        Mocks.Step1.recipeId,
        ItemId.SpeedModule,
        0,
        emitter
      );
      expect(emitter.emit).toHaveBeenCalledWith({
        id: Mocks.Step1.recipeId,
        value: new Array(4).fill(ItemId.SpeedModule),
        default: new Array(4).fill(ItemId.SpeedModule3),
      });
    });
  });

  describe('changeBeaconCount', () => {
    it('should set beacon count', () => {
      const emitter = new EventEmitter<DefaultIdPayload>();
      spyOn(emitter, 'emit');
      component.child.changeBeaconCount(
        Mocks.Step1.recipeId,
        { target: { value: '12' } } as any,
        emitter,
        id
      );
      expect(emitter.emit).toHaveBeenCalledWith({
        id,
        value: '12',
        default: '8',
      });
    });

    it('should not set beacon count on invalid event', () => {
      const emitter = new EventEmitter<DefaultIdPayload>();
      spyOn(emitter, 'emit');
      component.child.changeBeaconCount(
        Mocks.Step1.recipeId,
        { target: {} } as any,
        emitter,
        id
      );
      expect(emitter.emit).not.toHaveBeenCalled();
    });

    it('should not emit on invalid value', () => {
      const emitter = new EventEmitter<DefaultIdPayload>();
      spyOn(emitter, 'emit');
      component.child.changeBeaconCount(
        Mocks.Step1.recipeId,
        { target: { value: '-1' } } as any,
        emitter,
        id
      );
      expect(emitter.emit).not.toHaveBeenCalled();
    });

    it('should use recipe id as default id', () => {
      const emitter = new EventEmitter<DefaultIdPayload>();
      spyOn(emitter, 'emit');
      component.child.changeBeaconCount(
        Mocks.Step1.recipeId,
        { target: { value: '12' } } as any,
        emitter
      );
      expect(emitter.emit).toHaveBeenCalledWith({
        id: Mocks.Step1.recipeId,
        value: '12',
        default: '8',
      });
    });
  });

  describe('changeBeacon', () => {
    it('should beacon modules', () => {
      const emitter = new EventEmitter<DefaultIdPayload>();
      spyOn(emitter, 'emit');
      component.child.changeBeacon(
        Mocks.Step1.recipeId,
        ItemId.Beacon,
        emitter,
        id
      );
      expect(emitter.emit).toHaveBeenCalledWith({
        id,
        value: ItemId.Beacon,
        default: ItemId.Beacon,
      });
    });

    it('should use recipe id as default id', () => {
      const emitter = new EventEmitter<DefaultIdPayload>();
      spyOn(emitter, 'emit');
      component.child.changeBeacon(
        Mocks.Step1.recipeId,
        ItemId.Beacon,
        emitter
      );
      expect(emitter.emit).toHaveBeenCalledWith({
        id: Mocks.Step1.recipeId,
        value: ItemId.Beacon,
        default: ItemId.Beacon,
      });
    });
  });

  describe('changeBeaconModules', () => {
    it('should beacon modules', () => {
      const emitter = new EventEmitter<DefaultIdPayload<string[]>>();
      spyOn(emitter, 'emit');
      component.child.changeBeaconModules(
        Mocks.Step1.recipeId,
        ItemId.SpeedModule,
        0,
        emitter,
        id
      );
      expect(emitter.emit).toHaveBeenCalledWith({
        id,
        value: new Array(2).fill(ItemId.SpeedModule),
        default: new Array(2).fill(ItemId.SpeedModule3),
      });
    });

    it('should use recipe id as default id', () => {
      const emitter = new EventEmitter<DefaultIdPayload<string[]>>();
      spyOn(emitter, 'emit');
      component.child.changeBeaconModules(
        Mocks.Step1.recipeId,
        ItemId.SpeedModule,
        0,
        emitter
      );
      expect(emitter.emit).toHaveBeenCalledWith({
        id: Mocks.Step1.recipeId,
        value: new Array(2).fill(ItemId.SpeedModule),
        default: new Array(2).fill(ItemId.SpeedModule3),
      });
    });
  });

  describe('generateModules', () => {
    it('should fill when index 0 is modified', () => {
      expect(
        component.child.generateModules(
          0,
          ItemId.SpeedModule,
          new Array(2).fill(ItemId.Module)
        )
      ).toEqual(new Array(2).fill(ItemId.SpeedModule));
    });

    it('should modify a specific index', () => {
      expect(
        component.child.generateModules(
          1,
          ItemId.SpeedModule,
          new Array(2).fill(ItemId.Module)
        )
      ).toEqual([ItemId.Module, ItemId.SpeedModule]);
    });
  });

  describe('gtZero', () => {
    it('should handle valid values', () => {
      expect(component.child.gtZero('0')).toBeFalse();
      expect(component.child.gtZero('0.5')).toBeTrue();
    });

    it('should handle invalid value', () => {
      expect(component.child.gtZero('x')).toBeFalse();
    });
  });
});
