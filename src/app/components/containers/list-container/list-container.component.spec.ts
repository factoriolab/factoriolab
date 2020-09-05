import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';

import { Mocks, ItemId } from 'src/tests';
import { DefaultIdPayload } from '~/models';
import { RouterService } from '~/services/router.service';
import { reducers, metaReducers, State } from '~/store';
import * as Items from '~/store/items';
import * as Recipes from '~/store/recipes';
import { ShowColumnAction, HideColumnAction } from '~/store/settings';
import { ListComponent } from './list/list.component';
import { ListContainerComponent } from './list-container.component';

describe('ListContainerComponent', () => {
  let component: ListContainerComponent;
  let fixture: ComponentFixture<ListContainerComponent>;
  let store: Store<State>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ListComponent, ListContainerComponent],
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
      providers: [RouterService],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ListContainerComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
        fixture.detectChanges();
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should ignore an item', () => {
    spyOn(store, 'dispatch');
    const data = Mocks.Item1.id;
    component.child.ignoreItem.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(new Items.IgnoreAction(data));
  });

  it('should set belt', () => {
    spyOn(store, 'dispatch');
    const data: DefaultIdPayload = {
      id: Mocks.Item1.id,
      value: ItemId.TransportBelt,
      default: ItemId.TransportBelt,
    };
    component.child.setBelt.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(new Items.SetBeltAction(data));
  });

  it('should set factory', () => {
    spyOn(store, 'dispatch');
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

  it('should set modules', () => {
    spyOn(store, 'dispatch');
    const data: DefaultIdPayload<string[]> = {
      id: Mocks.Recipe1.id,
      value: [ItemId.SpeedModule],
      default: [],
    };
    component.child.setModules.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Recipes.SetModulesAction(data)
    );
  });

  it('should set beacon module', () => {
    spyOn(store, 'dispatch');
    const data: DefaultIdPayload = {
      id: Mocks.Recipe1.id,
      value: ItemId.SpeedModule,
      default: ItemId.SpeedModule,
    };
    component.child.setBeaconModule.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Recipes.SetBeaconModuleAction(data)
    );
  });

  it('should set beacon count', () => {
    spyOn(store, 'dispatch');
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

  it('should show a column', () => {
    spyOn(store, 'dispatch');
    const data = 'id';
    component.child.showColumn.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(new ShowColumnAction(data));
  });

  it('should hide a column', () => {
    spyOn(store, 'dispatch');
    const data = 'id';
    component.child.hideColumn.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(new HideColumnAction(data));
  });

  it('should reset item to default', () => {
    spyOn(store, 'dispatch');
    const data = Mocks.Item1.id;
    component.child.resetItem.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(new Items.ResetAction(data));
  });

  it('should reset recipe to default', () => {
    spyOn(store, 'dispatch');
    const data = Mocks.Recipe1.id;
    component.child.resetRecipe.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(new Recipes.ResetAction(data));
  });

  it('should reset ignore modifications', () => {
    spyOn(store, 'dispatch');
    component.child.resetIgnore.emit();
    expect(store.dispatch).toHaveBeenCalledWith(new Items.ResetIgnoreAction());
  });

  it('should reset belt modifications', () => {
    spyOn(store, 'dispatch');
    component.child.resetBelt.emit();
    expect(store.dispatch).toHaveBeenCalledWith(new Items.ResetBeltAction());
  });

  it('should reset factory modifications', () => {
    spyOn(store, 'dispatch');
    component.child.resetFactory.emit();
    expect(store.dispatch).toHaveBeenCalledWith(
      new Recipes.ResetFactoryAction()
    );
  });

  it('should reset module modifications', () => {
    spyOn(store, 'dispatch');
    component.child.resetModules.emit();
    expect(store.dispatch).toHaveBeenCalledWith(
      new Recipes.ResetModulesAction()
    );
  });

  it('should reset beacon modifications', () => {
    spyOn(store, 'dispatch');
    component.child.resetBeacons.emit();
    expect(store.dispatch).toHaveBeenCalledWith(
      new Recipes.ResetBeaconsAction()
    );
  });
});
