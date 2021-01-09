import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';

import { TestUtility, ItemId, RecipeId } from 'src/tests';
import {
  IconComponent,
  OptionsComponent,
  RankerComponent,
  SelectComponent,
  ToggleComponent,
} from '~/components';
import {
  DisplayRate,
  ResearchSpeed,
  Preset,
  InserterTarget,
  InserterCapacity,
  DefaultIdPayload,
  DefaultPayload,
} from '~/models';
import { reducers, metaReducers, State } from '~/store';
import { ResetAction } from '~/store/app.actions';
import * as Factories from '~/store/factories';
import * as Preferences from '~/store/preferences';
import * as Settings from '~/store/settings';
import { SettingsComponent } from './settings/settings.component';
import { SettingsContainerComponent } from './settings-container.component';

describe('SettingsContainerComponent', () => {
  let component: SettingsContainerComponent;
  let fixture: ComponentFixture<SettingsContainerComponent>;
  let store: Store<State>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
      declarations: [
        IconComponent,
        OptionsComponent,
        RankerComponent,
        SelectComponent,
        ToggleComponent,
        SettingsComponent,
        SettingsContainerComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(Store);
    spyOn(store, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should determine whether in overlay mode', () => {
    const value = component.isInOverlayMode;
    expect(value).toBeFalse();
  });

  it('should set opening to false on first click', () => {
    spyOn(component.closeSettings, 'emit');
    document.body.click();
    expect(component.opening).toBeFalse();
    expect(component.closeSettings.emit).not.toHaveBeenCalled();
  });

  it('should cancel when clicked away in overlay mode', () => {
    spyOn(component.closeSettings, 'emit');
    spyOnProperty(component, 'isInOverlayMode', 'get').and.returnValue(true);
    component.opening = false;
    document.body.click();
    expect(component.closeSettings.emit).toHaveBeenCalled();
  });

  it('should not cancel when clicked away in wide screen mode', () => {
    spyOn(component.closeSettings, 'emit');
    spyOnProperty(component, 'isInOverlayMode', 'get').and.returnValue(false);
    component.opening = false;
    document.body.click();
    expect(component.closeSettings.emit).not.toHaveBeenCalled();
  });

  it('should not cancel when clicked on', () => {
    spyOn(component.closeSettings, 'emit');
    component.opening = false;
    TestUtility.clickSelector(fixture, 'lab-settings');
    expect(component.closeSettings.emit).not.toHaveBeenCalled();
  });

  it('should reset settings', () => {
    component.child.resetSettings.emit();
    expect(store.dispatch).toHaveBeenCalledWith(new ResetAction());
  });

  it('should save a state', () => {
    const value = { id: 'test', value: 'hash' };
    component.child.saveState.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Preferences.SaveStateAction(value)
    );
  });

  it('should delete a state', () => {
    const value = 'id';
    component.child.deleteState.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Preferences.DeleteStateAction(value)
    );
  });

  it('should set the preset', () => {
    const value = Preset.Modules;
    component.child.setPreset.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetPresetAction(value)
    );
  });

  it('should set the base dataset', () => {
    const value = 'base';
    component.child.setBase.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetBaseAction(value)
    );
  });

  it('should set the disabled recipes', () => {
    const value = { value: [RecipeId.BasicOilProcessing], default: [] };
    component.child.setDisabledRecipes.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetDisabledRecipesAction(value)
    );
  });

  it('should set the expensive flag', () => {
    const value = true;
    component.child.setExpensive.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetExpensiveAction(value)
    );
  });

  it('should add a factory', () => {
    const value: DefaultPayload<string, string[]> = {
      value: 'value',
      default: ['value'],
    };
    component.child.addFactory.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(new Factories.AddAction(value));
  });

  it('should remove a factory', () => {
    const value: DefaultPayload<string, string[]> = {
      value: 'value',
      default: ['value'],
    };
    component.child.removeFactory.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.RemoveAction(value)
    );
  });

  it('should raise a factory', () => {
    const value: DefaultPayload<string, string[]> = {
      value: 'value',
      default: ['value'],
    };
    component.child.raiseFactory.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.RaiseAction(value)
    );
  });

  it('should set a factory', () => {
    const value: DefaultIdPayload<string, string[]> = {
      id: 'id',
      value: 'value',
      default: ['value'],
    };
    component.child.setFactory.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.SetFactoryAction(value)
    );
  });

  it('should set a factory module rank', () => {
    const value: DefaultIdPayload<string[]> = {
      id: 'id',
      value: ['value'],
      default: ['value'],
    };
    component.child.setModuleRank.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.SetModuleRankAction(value)
    );
  });

  it('should set a factory beacon count', () => {
    const value: DefaultIdPayload<number> = { id: 'id', value: 0, default: 0 };
    component.child.setBeaconCount.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.SetBeaconCountAction(value)
    );
  });

  it('should set a factory beacon', () => {
    const value: DefaultIdPayload = {
      id: 'id',
      value: 'value',
      default: 'value',
    };
    component.child.setBeacon.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.SetBeaconAction(value)
    );
  });

  it('should set a factory beacon module', () => {
    const value: DefaultIdPayload = {
      id: 'id',
      value: 'value',
      default: 'value',
    };
    component.child.setBeaconModule.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.SetBeaconModuleAction(value)
    );
  });

  it('should set the default belt', () => {
    const value = {
      value: ItemId.TransportBelt,
      default: ItemId.TransportBelt,
    };
    component.child.setBelt.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetBeltAction(value)
    );
  });

  it('should set the fuel', () => {
    const value = { value: ItemId.Wood, default: ItemId.Wood };
    component.child.setFuel.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetFuelAction(value)
    );
  });

  it('should set the flow rate', () => {
    const value = 1000;
    component.child.setFlowRate.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetFlowRateAction(value)
    );
  });

  it('should set the inserter target', () => {
    const value = InserterTarget.Chest;
    component.child.setInserterTarget.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetInserterTargetAction(value)
    );
  });

  it('should set the mining productivity bonus', () => {
    const value = 10;
    component.child.setMiningBonus.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetMiningBonusAction(value)
    );
  });

  it('should set the research speed bonus', () => {
    const value = ResearchSpeed.Speed3;
    component.child.setResearchSpeed.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetResearchSpeedAction(value)
    );
  });

  it('should set the inserter capacity', () => {
    const value = InserterCapacity.Capacity2;
    component.child.setInserterCapacity.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetInserterCapacityAction(value)
    );
  });

  it('should set display rate', () => {
    const value = DisplayRate.PerSecond;
    component.child.setDisplayRate.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetDisplayRateAction(value)
    );
  });
});
