import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';

import { TestUtility, ItemId, RecipeId } from 'src/tests';
import { IconComponent, PrecisionComponent } from '~/components';
import {
  DisplayRate,
  ResearchSpeed,
  Theme,
  Preset,
  Sort,
  LinkValue,
} from '~/models';
import { reducers, metaReducers, State } from '~/store';
import * as Settings from '~/store/settings';
import { SettingsComponent } from './settings/settings.component';
import { SettingsContainerComponent } from './settings-container.component';

describe('SettingsContainerComponent', () => {
  let component: SettingsContainerComponent;
  let fixture: ComponentFixture<SettingsContainerComponent>;
  let store: Store<State>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
      declarations: [
        IconComponent,
        PrecisionComponent,
        SettingsComponent,
        SettingsContainerComponent,
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(SettingsContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        store = TestBed.inject(Store);
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should determine whether in overlay mode', () => {
    const value = component.isInOverlayMode();
    expect(value).toBeFalse();
  });

  it('should set opening to false on first click', () => {
    spyOn(component.cancel, 'emit');
    document.body.click();
    expect(component.opening).toBeFalse();
    expect(component.cancel.emit).not.toHaveBeenCalled();
  });

  it('should cancel when clicked away in overlay mode', () => {
    spyOn(component.cancel, 'emit');
    spyOn(component, 'isInOverlayMode').and.returnValue(true);
    component.opening = false;
    document.body.click();
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should not cancel when clicked away in wide screen mode', () => {
    spyOn(component.cancel, 'emit');
    spyOn(component, 'isInOverlayMode').and.returnValue(false);
    component.opening = false;
    document.body.click();
    expect(component.cancel.emit).not.toHaveBeenCalled();
  });

  it('should not cancel when clicked on', () => {
    spyOn(component.cancel, 'emit');
    component.opening = false;
    TestUtility.clickSelector(fixture, 'lab-settings');
    expect(component.cancel.emit).not.toHaveBeenCalled();
  });

  it('should save a state', () => {
    spyOn(store, 'dispatch');
    const value = { id: 'test', value: 'hash' };
    component.child.saveState.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SaveStateAction(value)
    );
  });

  it('should delete a state', () => {
    spyOn(store, 'dispatch');
    const value = 'id';
    component.child.deleteState.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.DeleteStateAction(value)
    );
  });

  it('should set the preset', () => {
    spyOn(store, 'dispatch');
    const value = Preset.Modules;
    component.child.setPreset.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetPresetAction(value)
    );
  });

  it('should set the base dataset', () => {
    spyOn(store, 'dispatch');
    const value = 'base';
    component.child.setBase.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetBaseAction(value)
    );
  });

  it('should set the selected mods', () => {
    spyOn(store, 'dispatch');
    const value = { value: ['test'], default: [] };
    component.child.setMods.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetModsAction(value)
    );
  });

  it('should set the disabled recipes', () => {
    spyOn(store, 'dispatch');
    const value = { value: [RecipeId.BasicOilProcessing], default: [] };
    component.child.setDisabledRecipes.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetDisabledRecipesAction(value)
    );
  });

  it('should set the expensive flag', () => {
    spyOn(store, 'dispatch');
    const value = true;
    component.child.setExpensive.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetExpensiveAction(value)
    );
  });

  it('should set the preferred factory rank', () => {
    spyOn(store, 'dispatch');
    const value = { value: [ItemId.AssemblingMachine1], default: [] };
    component.child.setFactoryRank.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetFactoryRankAction(value)
    );
  });

  it('should set the preferred module rank', () => {
    spyOn(store, 'dispatch');
    const value = { value: [ItemId.SpeedModule], default: [] };
    component.child.setModuleRank.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetModuleRankAction(value)
    );
  });

  it('should set the drill module flag', () => {
    spyOn(store, 'dispatch');
    const value = true;
    component.child.setDrillModule.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetDrillModuleAction(value)
    );
  });

  it('should set the default beacon', () => {
    spyOn(store, 'dispatch');
    const value = { value: ItemId.Beacon, default: ItemId.Beacon };
    component.child.setBeacon.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetBeaconAction(value)
    );
  });

  it('should set the default beacon module', () => {
    spyOn(store, 'dispatch');
    const value = { value: ItemId.SpeedModule, default: ItemId.SpeedModule };
    component.child.setBeaconModule.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetBeaconModuleAction(value)
    );
  });

  it('should set the default beacon count', () => {
    spyOn(store, 'dispatch');
    const value = { value: 2, default: 0 };
    component.child.setBeaconCount.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetBeaconCountAction(value)
    );
  });

  it('should set the default belt', () => {
    spyOn(store, 'dispatch');
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
    spyOn(store, 'dispatch');
    const value = { value: ItemId.Wood, default: ItemId.Wood };
    component.child.setFuel.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetFuelAction(value)
    );
  });

  it('should set the flow rate', () => {
    spyOn(store, 'dispatch');
    const value = 1000;
    component.child.setFlowRate.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetFlowRateAction(value)
    );
  });

  it('should set display rate', () => {
    spyOn(store, 'dispatch');
    const value = DisplayRate.PerSecond;
    component.child.setDisplayRate.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetDisplayRateAction(value)
    );
  });

  it('should set item precision', () => {
    spyOn(store, 'dispatch');
    const value = 0;
    component.child.setItemPrecision.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetItemPrecisionAction(value)
    );
  });

  it('should set belt precision', () => {
    spyOn(store, 'dispatch');
    const value = 0;
    component.child.setBeltPrecision.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetBeltPrecisionAction(value)
    );
  });

  it('should set wagon precision', () => {
    spyOn(store, 'dispatch');
    const value = 0;
    component.child.setWagonPrecision.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetWagonPrecisionAction(value)
    );
  });

  it('should set factory precision', () => {
    spyOn(store, 'dispatch');
    const value = 0;
    component.child.setFactoryPrecision.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetFactoryPrecisionAction(value)
    );
  });

  it('should set power precision', () => {
    spyOn(store, 'dispatch');
    const value = 0;
    component.child.setPowerPrecision.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetPowerPrecisionAction(value)
    );
  });

  it('should set pollution precision', () => {
    spyOn(store, 'dispatch');
    const value = 0;
    component.child.setPollutionPrecision.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetPollutionPrecisionAction(value)
    );
  });

  it('should set the mining productivity bonus', () => {
    spyOn(store, 'dispatch');
    const value = 10;
    component.child.setMiningBonus.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetMiningBonusAction(value)
    );
  });

  it('should set the research speed bonus', () => {
    spyOn(store, 'dispatch');
    const value = ResearchSpeed.Speed3;
    component.child.setResearchSpeed.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetResearchSpeedAction(value)
    );
  });

  it('should set sort', () => {
    spyOn(store, 'dispatch');
    const value = Sort.BreadthFirst;
    component.child.setSort.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetSortAction(value)
    );
  });

  it('should set link value', () => {
    spyOn(store, 'dispatch');
    const value = LinkValue.Belts;
    component.child.setLinkValue.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetLinkValueAction(value)
    );
  });

  it('should set theme', () => {
    spyOn(store, 'dispatch');
    const value = Theme.DarkMode;
    component.child.setTheme.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetThemeAction(value)
    );
  });

  it('should reset settings', () => {
    spyOn(store, 'dispatch');
    component.child.resetSettings.emit();
    expect(store.dispatch).toHaveBeenCalledWith(new Settings.ResetAction());
  });
});
