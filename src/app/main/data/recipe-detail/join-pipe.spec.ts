import { JoinPipe } from './join-pipe';

describe('JoinPipe', () => {
  it('should return an empty string if the value is nullish', () => {
    expect(JoinPipe.transform(null)).toEqual('');
  });
});
