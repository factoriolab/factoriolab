import { SetJoinPipe } from './set';

describe('SetJoinPipe', () => {
  let pipe: SetJoinPipe;

  beforeEach(() => {
    pipe = new SetJoinPipe();
  });

  it('should join values from numeric or string arrays', () => {
    expect(pipe.transform([1, 2, 3])).toEqual('1, 2, 3');
    expect(pipe.transform(['a', 'b', 'c'])).toEqual('a, b, c');
  });

  it('should handle nullish values', () => {
    expect(pipe.transform(null)).toEqual('');
  });
});
