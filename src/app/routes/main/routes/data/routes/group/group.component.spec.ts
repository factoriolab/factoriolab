import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, setInputs, TestModule } from '~/tests';

import { GroupComponent } from './group.component';

describe('GroupComponent', () => {
  let component: GroupComponent;
  let fixture: ComponentFixture<GroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, GroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupComponent);
    component = fixture.componentInstance;
    setInputs(fixture, {
      id: Mocks.groupId,
      collectionLabel: 'data.items',
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
