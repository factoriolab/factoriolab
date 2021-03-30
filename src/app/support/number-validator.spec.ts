import { validateNumber } from './number-validator';

describe('validateNumber', () => {
  it('should return null for null value', () => {
    expect(validateNumber({} as any)).toBeNull();
  });

  it('should return null for a valid number', () => {
    expect(validateNumber({ value: '1 1/3' } as any)).toBeNull();
  });

  it('should return state for invalid value', () => {
    expect(
      validateNumber({ value: '1 1' } as any).validateNumber.valid
    ).toBeFalse();
  });

  it('should return state for negative value', () => {
    expect(
      validateNumber({ value: '-1' } as any).validateNumber.valid
    ).toBeFalse();
  });
});
