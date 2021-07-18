import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';

import { reducers, State, metaReducers } from '~/store';
import { MatrixComponent } from './matrix/matrix.component';
import { MatrixContainerComponent } from './matrix-container.component';

describe('MatrixContainerComponent', () => {
  let component: MatrixContainerComponent;
  let fixture: ComponentFixture<MatrixContainerComponent>;
  let store: Store<State>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MatrixContainerComponent, MatrixComponent],
      imports: [StoreModule.forRoot(reducers, { metaReducers })],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatrixContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(Store);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
