import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';

import { Mocks, ItemId } from 'src/tests';
import { ColumnsComponent, IconComponent, SelectComponent } from '~/components';
import { DefaultIdPayload, DefaultPayload } from '~/models';
import { RouterService } from '~/services/router.service';
import { reducers, metaReducers, State } from '~/store';
import * as Items from '~/store/items';
import * as Preferences from '~/store/preferences';
import * as Recipes from '~/store/recipes';
import { SetDisabledRecipesAction } from '~/store/settings';
import { ListComponent } from './list/list.component';
import { ListContainerComponent } from './list-container.component';

describe('ListContainerComponent', () => {
  let component: ListContainerComponent;
  let fixture: ComponentFixture<ListContainerComponent>;
  let store: Store<State>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ColumnsComponent,
        IconComponent,
        SelectComponent,
        ListComponent,
        ListContainerComponent,
      ],
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
      providers: [RouterService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(Store);
    spyOn(store, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bypass steps observable if specified by parent', () => {
    component.steps$ = null;
    component.steps = Mocks.Steps;
    component.ngOnInit();
    expect(component.steps$).toBeNull();
  });

  it('should ignore an item', () => {
    const data = Mocks.Item1.id;
    component.child.ignoreItem.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Items.IgnoreItemAction(data)
    );
  });

  it('should set belt', () => {
    const data: DefaultIdPayload = {
      id: Mocks.Item1.id,
      value: ItemId.TransportBelt,
      default: ItemId.TransportBelt,
    };
    component.child.setBelt.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(new Items.SetBeltAction(data));
  });

  it('should set factory', () => {
    const data: DefaultIdPayload = {
      id: Mocks.Recipe1.id,
      value: ItemId.StoneFurnace,
      default: ItemId.StoneFurnace,
    };
    component.child.setFactory.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Recipes.SetFactoryAction(data)
    );
  });

  it('should set factory modules', () => {
    const data: DefaultIdPayload<string[]> = {
      id: Mocks.Recipe1.id,
      value: [ItemId.SpeedModule],
      default: [],
    };
    component.child.setFactoryModules.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Recipes.SetFactoryModulesAction(data)
    );
  });

  it('should set beacon count', () => {
    const data: DefaultIdPayload<number> = {
      id: Mocks.Recipe1.id,
      value: 24,
      default: 16,
    };
    component.child.setBeaconCount.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Recipes.SetBeaconCountAction(data)
    );
  });

  it('should set beacon', () => {
    const data: DefaultIdPayload = {
      id: Mocks.Recipe1.id,
      value: ItemId.Beacon,
      default: ItemId.Beacon,
    };
    component.child.setBeacon.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Recipes.SetBeaconAction(data)
    );
  });

  it('should set beacon modules', () => {
    const data: DefaultIdPayload<string[]> = {
      id: Mocks.Recipe1.id,
      value: [ItemId.SpeedModule],
      default: [ItemId.SpeedModule],
    };
    component.child.setBeaconModules.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Recipes.SetBeaconModulesAction(data)
    );
  });

  it('should set the visible columns', () => {
    const data = Preferences.initialColumnsState;
    component.child.setColumns.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Preferences.SetColumnsAction(data)
    );
  });

  it('should reset item to default', () => {
    const data = Mocks.Item1.id;
    component.child.resetItem.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Items.ResetItemAction(data)
    );
  });

  it('should reset recipe to default', () => {
    const data = Mocks.Recipe1.id;
    component.child.resetRecipe.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Recipes.ResetRecipeAction(data)
    );
  });

  it('should reset ignore modifications', () => {
    component.child.resetIgnore.emit();
    expect(store.dispatch).toHaveBeenCalledWith(new Items.ResetIgnoreAction());
  });

  it('should reset belt modifications', () => {
    component.child.resetBelt.emit();
    expect(store.dispatch).toHaveBeenCalledWith(new Items.ResetBeltAction());
  });

  it('should reset factory modifications', () => {
    component.child.resetFactory.emit();
    expect(store.dispatch).toHaveBeenCalledWith(
      new Recipes.ResetFactoryAction()
    );
  });

  it('should reset beacon modifications', () => {
    component.child.resetBeacons.emit();
    expect(store.dispatch).toHaveBeenCalledWith(
      new Recipes.ResetBeaconsAction()
    );
  });

  it('should set the list of disabled recipes', () => {
    const value: DefaultPayload<string[]> = { value: [], default: [] };
    component.child.setDisabledRecipes.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SetDisabledRecipesAction(value)
    );
  });
});
