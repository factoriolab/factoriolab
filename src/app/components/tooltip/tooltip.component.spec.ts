import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemId, TestModule, TestUtility } from 'src/tests';

import { TooltipComponent } from './tooltip.component';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule, TooltipComponent],
    });
    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    TestUtility.setInputs(fixture, { id: ItemId.IronPlate });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
