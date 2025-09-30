import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulesSelect } from './modules-select';

describe('ModulesSelect', () => {
  let component: ModulesSelect;
  let fixture: ComponentFixture<ModulesSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModulesSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModulesSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
