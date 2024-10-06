import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests';

import { IdComponent } from './id.component';

describe('IdComponent', () => {
  let component: IdComponent;
  let fixture: ComponentFixture<IdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, IdComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
