import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemId, Mocks, TestModule, TestUtility } from 'src/tests';
import { ModulesComponent } from './modules.component';

describe('ModulesComponent', () => {
  let component: ModulesComponent;
  let fixture: ComponentFixture<ModulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModulesComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ModulesComponent);
    component = fixture.componentInstance;
    TestUtility.setInputs(fixture, {
      entity: Mocks.Dataset.machineEntities[ItemId.AssemblingMachine3],
      modules: [],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
