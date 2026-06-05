import { reduceRecord, toBoolRecord, toRecord } from './record';

const id = 'id';

describe('reduceRecord', () => {
  it('should reduce a record of strings to a map of boolean records', () => {
    expect(reduceRecord({ a: ['b', 'c'] })).toEqual({
      a: { b: true, c: true },
    });
  });
});

describe('toBoolRecord', () => {
  it('should map a list of strings to a boolean record object', () => {
    expect(toBoolRecord([id])).toEqual({ [id]: true });
  });
});

describe('toRecord', () => {
  it('should map id-based objects to an Record object', () => {
    expect(toRecord([{ id }])).toEqual({ id: { id } });
  });

  it('should warn about duplicate ids', () => {
    spyOn(console, 'warn');
    toRecord([{ id }, { id }]);
    expect(console.warn).toHaveBeenCalled();
  });
});
