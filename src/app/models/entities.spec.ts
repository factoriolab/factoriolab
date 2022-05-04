import { toBoolEntities, toEntities } from './entities';

const id = 'id';

describe('toEntities', () => {
  it('should map id-based objects to an entities object', () => {
    expect(toEntities([{ id }])).toEqual({ [id]: { id } });
  });
});

describe('toBoolEntities', () => {
  it('should map a list of strings to a boolean entities object', () => {
    expect(toBoolEntities([id])).toEqual({ [id]: true });
  });
});
