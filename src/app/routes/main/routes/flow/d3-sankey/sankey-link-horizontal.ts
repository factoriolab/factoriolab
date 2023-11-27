import { Path } from 'd3-path';
import { SankeyLink, SankeyNode } from 'd3-sankey';
import { Link, link, linkHorizontal } from 'd3-shape';

import { SankeyLinkExtraProperties, SankeyNodeExtraProperties } from './models';

function horizontalSource<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(d: SankeyLink<N, L>): [number, number] {
  return [(d.source as SankeyNode<N, L>).x1!, d.y0!];
}

function horizontalTarget<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(d: SankeyLink<N, L>): [number, number] {
  return [(d.target as SankeyNode<N, L>).x0!, d.y1!];
}

export function sankeyLinkHorizontal<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(): Link<unknown, SankeyLink<N, L>, [number, number]> {
  return linkHorizontal<SankeyLink<N, L>, [number, number]>()
    .source(horizontalSource)
    .target(horizontalTarget);
}

export function sankeyLinkLoop<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(
  width: number,
  padding: number,
  bottom0: number,
  bottom1: number,
): Link<unknown, SankeyLink<N, L>, [number, number]> {
  return linkHorizontalLoop<SankeyLink<N, L>, [number, number]>(
    width,
    padding,
    bottom0,
    bottom1,
  )
    .source(horizontalSource)
    .target(horizontalTarget);
}

function linkHorizontalLoop<L, N>(
  width: number,
  padding: number,
  bottom0: number,
  bottom1: number,
): Link<unknown, L, N> {
  return link<L, N>(bumpSankeyLoopX(width, padding, bottom0, bottom1));
}

function bumpSankeyLoopX(
  width: number,
  padding: number,
  bottom0: number,
  bottom1: number,
): (context: CanvasRenderingContext2D | Path) => BumpSankeyLoop {
  return (context: CanvasRenderingContext2D | Path) =>
    new BumpSankeyLoop(context, true, width, padding, bottom0, bottom1);
}

function bumpSankeyLoopY(
  width: number,
  padding: number,
  bottom0: number,
  bottom1: number,
): (context: CanvasRenderingContext2D | Path) => BumpSankeyLoop {
  return (context: CanvasRenderingContext2D | Path) =>
    new BumpSankeyLoop(context, false, width, padding, bottom0, bottom1);
}

class BumpSankeyLoop {
  _context: CanvasRenderingContext2D | Path;
  _x: boolean;
  _width: number;
  _padding: number;
  _bottom0: number;
  _bottom1: number;
  _x0: number | undefined;
  _y0: number | undefined;
  _line: number | undefined;
  _point: number | undefined;

  constructor(
    context: CanvasRenderingContext2D | Path,
    x: boolean,
    width: number,
    padding: number,
    bottom0: number,
    bottom1: number,
  ) {
    this._context = context;
    this._x = x;
    this._width = width;
    this._padding = padding;
    this._bottom0 = bottom0;
    this._bottom1 = bottom1;
  }

  areaStart(): void {
    this._line = 0;
  }

  areaEnd(): void {
    this._line = NaN;
  }

  lineStart(): void {
    this._point = 0;
  }

  lineEnd(): void {
    if (this._line || (this._line !== 0 && this._point === 1))
      this._context.closePath();
    this._line = 1 - this._line!;
  }

  point(x: number, y: number): void {
    (x = +x), (y = +y);
    switch (this._point) {
      case 0: {
        this._point = 1;
        if (this._line) this._context.lineTo(x, y);
        else this._context.moveTo(x, y);
        break;
      }
      case 1:
      default: {
        this._point = 2;
        if (this._x) {
          this._context.bezierCurveTo(
            this._x0! + this._width + this._padding,
            this._y0!,
            this._x0! + this._width + this._padding,
            (this._bottom0 = this._bottom0 + this._width / 2 + this._padding),
            this._x0!,
            this._bottom0,
          );
          this._context.bezierCurveTo(
            (this._x0 = (this._x0! + x) / 2),
            this._bottom0,
            this._x0,
            (this._bottom1 = this._bottom1 + this._width / 2 + this._padding),
            x,
            this._bottom1,
          );
          this._context.bezierCurveTo(
            x - this._width - this._padding,
            this._bottom1,
            x - this._width - this._padding,
            y,
            x,
            y,
          );
        } else
          this._context.bezierCurveTo(
            this._x0! - 100,
            (this._y0 = (this._y0! + y) / 2) - 100,
            x + 100,
            this._y0 - 100,
            x,
            y,
          );
        break;
      }
    }
    (this._x0 = x), (this._y0 = y);
  }
}
