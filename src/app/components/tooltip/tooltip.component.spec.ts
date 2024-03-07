import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemId, TestModule } from 'src/tests';
import { TooltipComponent } from './tooltip.component';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TooltipComponent],
      imports: [TestModule],
    });
    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', ItemId.IronPlate);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
