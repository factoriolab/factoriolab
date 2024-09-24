import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { rational } from '~/models/rational';
import { ItemId, RecipeId, TestModule } from '~/tests';

import { WizardComponent } from './wizard.component';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, WizardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selectId', () => {
    it('should set the id and state', () => {
      component.selectId(ItemId.IronPlate, 'item');
      expect(component.id).toEqual(ItemId.IronPlate);
      expect(component.state).toEqual('item');
    });
  });

  // it('should dispatch actions', () => {
  //   spyOn(component.router, 'navigate').and.returnValue(Promise.resolve(true));
  //   const dispatch = new DispatchTest(mockStore, component);
  //   dispatch.props('setDisplayRate', setDisplayRate);
  //   dispatch.spy.calls.reset();
  //   component.createItemObjective(ItemId.IronPlate);
  //   expect(dispatch.mockStore.dispatch).toHaveBeenCalledWith(
  //     create({
  //       objective: {
  //         id: '0',
  //         targetId: ItemId.IronPlate,
  //         value: rational.one,
  //         unit: ObjectiveUnit.Items,
  //         type: ObjectiveType.Output,
  //       },
  //     }),
  //   );
  //   dispatch.spy.calls.reset();
  //   component.createRecipeObjective(RecipeId.IronPlate);
  //   expect(dispatch.mockStore.dispatch).toHaveBeenCalledWith(
  //     create({
  //       objective: {
  //         id: '0',
  //         targetId: ItemId.IronPlate,
  //         value: rational.one,
  //         unit: ObjectiveUnit.Machines,
  //         type: ObjectiveType.Output,
  //       },
  //     }),
  //   );
  // });
});
