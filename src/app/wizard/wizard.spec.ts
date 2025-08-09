import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wizard } from './wizard';

describe('Wizard', () => {
  let component: Wizard;
  let fixture: ComponentFixture<Wizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wizard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Wizard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
