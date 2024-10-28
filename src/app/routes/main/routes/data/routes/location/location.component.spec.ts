import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemId, setInputs, TestModule } from '~/tests';

import { LocationComponent } from './location.component';

describe('LocationComponent', () => {
  let component: LocationComponent;
  let fixture: ComponentFixture<LocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, LocationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationComponent);
    component = fixture.componentInstance;
    setInputs(fixture, {
      id: ItemId.AssemblingMachine2,
      collectionLabel: 'data.locations',
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
