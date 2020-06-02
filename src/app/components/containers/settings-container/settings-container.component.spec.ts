import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { StoreModule, Store } from '@ngrx/store';

import { IconComponent } from '~/components';
import { DisplayRate, ItemId, RecipeId, ResearchSpeed, Theme } from '~/models';
import { reducers, metaReducers, State } from '~/store';
import * as Settings from '~/store/settings';
import { TestUtility } from '~/utilities/test';
import { SettingsComponent } from './settings/settings.component';
import { SettingsContainerComponent } from './settings-container.component';

describe('SettingsContainerComponent', () => {
  let component: SettingsContainerComponent;
  let fixture: ComponentFixture<SettingsContainerComponent>;
  let store: Store<State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, StoreModule.forRoot(reducers, { metaReducers })],
      declarations: [
        IconComponent,
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
  }));

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

  it('should set factory precision', () => {
    spyOn(store, 'dispatch');
    const value = 0;
    component.child.setFactoryPrecision.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetFactoryPrecisionAction(value)
    );
  });

  it('should set theme', () => {
    spyOn(store, 'dispatch');
    const value = Theme.DarkMode;
    component.child.setTheme.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(new Settings.SetTheme(value));
  });

  it('should set the default belt', () => {
    spyOn(store, 'dispatch');
    const value = ItemId.TransportBelt;
    component.child.setBelt.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetBeltAction(value)
    );
  });

  it('should set the default assembler', () => {
    spyOn(store, 'dispatch');
    const value = ItemId.AssemblingMachine1;
    component.child.setAssembler.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetAssemblerAction(value)
    );
  });

  it('should set the default furnace', () => {
    spyOn(store, 'dispatch');
    const value = ItemId.StoneFurnace;
    component.child.setFurnace.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetFurnaceAction(value)
    );
  });

  it('should set the oil recipe', () => {
    spyOn(store, 'dispatch');
    const value = RecipeId.BasicOilProcessing;
    component.child.setOilRecipe.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetOilRecipeAction(value)
    );
  });

  it('should set the fuel', () => {
    spyOn(store, 'dispatch');
    const value = ItemId.Wood;
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

  it('should set the default prod module', () => {
    spyOn(store, 'dispatch');
    const value = ItemId.ProductivityModule;
    component.child.setProdModule.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetProdModuleAction(value)
    );
  });

  it('should set the default speed module', () => {
    spyOn(store, 'dispatch');
    const value = ItemId.SpeedModule;
    component.child.setSpeedModule.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetSpeedModuleAction(value)
    );
  });

  it('should set the default beacon module', () => {
    spyOn(store, 'dispatch');
    const value = ItemId.SpeedModule;
    component.child.setBeaconModule.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetBeaconModuleAction(value)
    );
  });

  it('should set the default beacon module count', () => {
    spyOn(store, 'dispatch');
    const value = 2;
    component.child.setBeaconCount.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetBeaconCountAction(value)
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

  it('should set the expensive flag', () => {
    spyOn(store, 'dispatch');
    const value = true;
    component.child.setExpensive.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetExpensiveAction(value)
    );
  });
});
