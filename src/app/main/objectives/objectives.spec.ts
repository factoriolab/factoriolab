import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Objectives } from './objectives';

describe('Objectives', () => {
  let component: Objectives;
  let fixture: ComponentFixture<Objectives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Objectives]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Objectives);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
