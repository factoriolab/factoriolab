import { toBoolRecord, toRecord } from './record';

const id = 'id';

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
