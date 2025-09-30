import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modules } from './modules';

describe('Modules', () => {
  let component: Modules;
  let fixture: ComponentFixture<Modules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modules]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Modules);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
