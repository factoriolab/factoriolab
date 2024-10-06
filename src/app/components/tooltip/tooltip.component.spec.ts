import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemId, setInputs, TestModule } from '~/tests';

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
    setInputs(fixture, { id: ItemId.IronPlate });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
