import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Picker } from './picker';

describe('Picker', () => {
  let component: Picker;
  let fixture: ComponentFixture<Picker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Picker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Picker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
