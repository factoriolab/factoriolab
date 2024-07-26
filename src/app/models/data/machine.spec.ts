import { parseMachine } from './machine';

describe('parseMachine', () => {
  it('should parse a machine with unlimited modules', () => {
    expect(parseMachine({ modules: true }).modules).toBeTrue();
  });
});
