import { TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests';

import { StepIdPipe } from './step-id.pipe';

describe('StepIdPipe', () => {
  let pipe: StepIdPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [StepIdPipe],
    });
    pipe = TestBed.inject(StepIdPipe);
  });

  it('should calculate a reusable id for a step based on its state', () => {
    expect(pipe.transform({ id: '0' })).toEqual('0');
    expect(pipe.transform({ id: '0', recipeId: 'recipe' })).toEqual('recipe');
    expect(
      pipe.transform({
        id: '0',
        recipeId: 'recipe',
        recipeObjectiveId: 'objective',
      }),
    ).toEqual('objective');
    expect(
      pipe.transform({
        id: '0',
        recipeId: 'recipe',
        recipeObjectiveId: 'objective',
        itemId: 'item',
      }),
    ).toEqual('item');
  });
});
