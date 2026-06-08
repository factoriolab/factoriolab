import { rational } from '~/rational/rational';

import { parseMachine } from './machine';

describe('parseMachine', () => {
  it('should parse a machine with unlimited modules', () => {
    expect(parseMachine({ modules: true }).modules).toBeTrue();
  });

  it('should parse a machine with a base effect', () => {
    expect(
      parseMachine({ baseEffect: { productivity: 0.5 } }).baseEffect
        ?.productivity,
    ).toEqual(rational(1n, 2n));
  });

  it('should convert 0 modules to undefined', () => {
    expect(parseMachine({ modules: 0 }).modules).toBeUndefined();
  });
});
