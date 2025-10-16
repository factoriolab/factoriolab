import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankSelect } from './rank-select';

describe('RankSelect', () => {
  let component: RankSelect;
  let fixture: ComponentFixture<RankSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RankSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
