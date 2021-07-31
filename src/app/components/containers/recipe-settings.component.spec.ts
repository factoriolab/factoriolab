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
      expect(
        component.child.getState(
          id,
          Mocks.Step1.recipeId,
          ItemId.BurnerMiningDrill
        )
      ).toEqual({
        recipe: component.recipeSettings[Mocks.Step1.recipeId],
        factory: component.factories.entities[ItemId.BurnerMiningDrill],
        fMatch: false,
      });
    });
  });

  describe('changeFactory', () => {
    it('should emit a factory', () => {
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
    it('should emit factory modules', () => {
      const emitter = new EventEmitter<DefaultIdPayload<string[]>>();
      spyOn(emitter, 'emit');
      component.child.changeFactoryModules(
        Mocks.Step1.recipeId,
        ItemId.SpeedModule,
        0,
        new Array(4).fill(ItemId.Module),
        emitter,
        id,
        ItemId.AssemblingMachine3
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
        new Array(4).fill(ItemId.Module),
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
    it('should emit beacon count', () => {
      const emitter = new EventEmitter<DefaultIdPayload>();
      spyOn(emitter, 'emit');
      component.child.changeBeaconCount(
        Mocks.Step1.recipeId,
        '12',
        emitter,
        id,
        ItemId.AssemblingMachine3
      );
      expect(emitter.emit).toHaveBeenCalledWith({
        id,
        value: '12',
        default: '8',
      });
    });

    it('should use recipe id as default id', () => {
      const emitter = new EventEmitter<DefaultIdPayload>();
      spyOn(emitter, 'emit');
      component.child.changeBeaconCount(Mocks.Step1.recipeId, '12', emitter);
      expect(emitter.emit).toHaveBeenCalledWith({
        id: Mocks.Step1.recipeId,
        value: '12',
        default: '8',
      });
    });
  });

  describe('changeBeacon', () => {
    it('should emit beacon modules', () => {
      const emitter = new EventEmitter<DefaultIdPayload>();
      spyOn(emitter, 'emit');
      component.child.changeBeacon(
        Mocks.Step1.recipeId,
        ItemId.Beacon,
        emitter,
        id,
        ItemId.AssemblingMachine3
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
    it('should emit beacon modules', () => {
      const emitter = new EventEmitter<DefaultIdPayload<string[]>>();
      spyOn(emitter, 'emit');
      component.child.changeBeaconModules(
        Mocks.Step1.recipeId,
        ItemId.SpeedModule,
        0,
        new Array(2).fill(ItemId.Module),
        emitter,
        id,
        ItemId.AssemblingMachine3,
        ItemId.Beacon
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
        [ItemId.Module, ItemId.Module],
        emitter
      );
      expect(emitter.emit).toHaveBeenCalledWith({
        id: Mocks.Step1.recipeId,
        value: new Array(2).fill(ItemId.SpeedModule),
        default: new Array(2).fill(ItemId.SpeedModule3),
      });
    });
  });

  describe('changeOverclock', () => {
    it('should emit overclock', () => {
      const emitter = new EventEmitter<DefaultIdPayload<number>>();
      spyOn(emitter, 'emit');
      component.child.changeOverclock(
        Mocks.Step1.recipeId,
        { target: { valueAsNumber: 200 } } as any,
        emitter,
        id,
        ItemId.AssemblingMachine3
      );
      expect(emitter.emit).toHaveBeenCalledWith({
        id,
        value: 200,
        default: null,
      });
    });

    it('should use recipe id as default id', () => {
      const emitter = new EventEmitter<DefaultIdPayload<number>>();
      spyOn(emitter, 'emit');
      component.child.changeOverclock(
        Mocks.Step1.recipeId,
        { target: { valueAsNumber: 200 } } as any,
        emitter
      );
      expect(emitter.emit).toHaveBeenCalledWith({
        id: Mocks.Step1.recipeId,
        value: 200,
        default: null,
      });
    });

    it('should ignore bad values', () => {
      const emitter = new EventEmitter<DefaultIdPayload<number>>();
      spyOn(emitter, 'emit');
      component.child.changeOverclock(
        Mocks.Step1.recipeId,
        { target: { valueAsNumber: 260 } } as any,
        emitter,
        id,
        ItemId.AssemblingMachine3
      );
      expect(emitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('generateModules', () => {
    it('should fill from the index to the right', () => {
      expect(
        component.child.generateModules(
          2,
          ItemId.SpeedModule,
          new Array(4).fill(ItemId.Module)
        )
      ).toEqual([
        ItemId.Module,
        ItemId.Module,
        ItemId.SpeedModule,
        ItemId.SpeedModule,
      ]);
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
