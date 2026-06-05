import { applyHue } from './color';

describe('applyHue', () => {
  it('should handle any hue', () => {
    const el = { style: { setProperty: (_value: string): void => {} } };
    spyOn(el.style, 'setProperty');
    applyHue(-1, 'name', el as any);
    applyHue(361, 'name', el as any);
    applyHue(349, 'name', el as any);
    expect(el.style.setProperty).toHaveBeenCalled();
  });
});
