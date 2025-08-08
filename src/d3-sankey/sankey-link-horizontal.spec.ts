import { BumpSankeyLoop } from './sankey-link-horizontal';

describe('BumpSankeyLoop', () => {
  let bump: BumpSankeyLoop;

  beforeEach(() => {
    bump = new BumpSankeyLoop(
      { closePath: () => {}, lineTo: () => {}, bezierCurveTo: () => {} } as any,
      0,
      0,
      0,
      0,
    );
  });

  it('should create', () => {
    expect(bump).toBeTruthy();
  });

  describe('areaStart', () => {
    it('should set line to zero', () => {
      bump.areaStart();
      expect(bump._line).toEqual(0);
    });
  });

  describe('areaEnd', () => {
    it('should set line to NaN', () => {
      bump.areaEnd();
      expect(bump._line).toEqual(NaN);
    });
  });

  describe('lineStart', () => {
    it('should set point to 0', () => {
      bump.lineStart();
      expect(bump._point).toEqual(0);
    });
  });

  describe('lineEnd', () => {
    it('should close path', () => {
      spyOn(bump._context, 'closePath');
      bump._line = 1;
      bump.lineEnd();
      expect(bump._context.closePath).toHaveBeenCalled();
      expect(bump._line).toEqual(0);
    });
  });

  describe('point', () => {
    it('should start with lineTo', () => {
      spyOn(bump._context, 'lineTo');
      bump._point = 0;
      bump._line = 1;
      bump.point(1, 1);
      expect(bump._context.lineTo).toHaveBeenCalled();
    });

    it('should flip loops', () => {
      spyOn(bump._context, 'lineTo');
      spyOn(bump._context, 'bezierCurveTo');
      bump._point = 1;
      bump._line = 1;
      bump.point(1, 1);
      expect(bump._context.bezierCurveTo).toHaveBeenCalledWith(
        0,
        0,
        0,
        0,
        0,
        0,
      );
      expect(bump._context.lineTo).toHaveBeenCalledWith(1, 0);
      expect(bump._context.bezierCurveTo).toHaveBeenCalledWith(
        1,
        0,
        1,
        1,
        1,
        1,
      );
    });
  });
});
