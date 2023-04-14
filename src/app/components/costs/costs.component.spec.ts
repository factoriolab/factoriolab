import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostsComponent } from './costs.component';

describe('CostsComponent', () => {
  let component: CostsComponent;
  let fixture: ComponentFixture<CostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
