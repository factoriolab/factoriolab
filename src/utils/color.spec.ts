import { applyBackgroundLightness, applyHue } from './color';

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

describe('applyBackgroundLightness', () => {
  it('should set and remove the --ground-950 property', () => {
    const el = document.createElement('div');
    spyOn(el.style, 'setProperty');
    applyBackgroundLightness(50, el);
    expect(el.style.setProperty).toHaveBeenCalled();
    spyOn(el.style, 'removeProperty');
    applyBackgroundLightness(undefined, el);
    expect(el.style.removeProperty).toHaveBeenCalled();
  });
});
