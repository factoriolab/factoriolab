import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeCell } from './tree-cell';

describe('TreeCell', () => {
  let component: TreeCell;
  let fixture: ComponentFixture<TreeCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
