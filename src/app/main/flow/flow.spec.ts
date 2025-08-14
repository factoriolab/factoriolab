import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Flow } from './flow';

describe('Flow', () => {
  let component: Flow;
  let fixture: ComponentFixture<Flow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Flow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Flow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
