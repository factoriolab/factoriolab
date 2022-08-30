import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickerComponent } from './picker.component';

describe('PickerComponent', () => {
  let component: PickerComponent;
  let fixture: ComponentFixture<PickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
