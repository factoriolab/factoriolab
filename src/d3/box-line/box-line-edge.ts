import { curveBasis, curveNatural, line } from 'd3';

import { coalesce } from '~/utils/nullish';

import { num } from '../helpers';
import { BoxEdge, BoxNode } from './models';

export function boxEdgeLine(
  offset = 5,
  forceLtr = false,
): (e: BoxEdge) => string | null {
  const generator = line();
  return (e: BoxEdge): string | null => {
    if (e.sourceNode === e.targetNode)
      return generator.curve(curveBasis)(getLoop(e, offset, forceLtr));

    const source = getNodePoint(e.sourceNode);
    const target = getNodePoint(e.targetNode);
    const arc = e.bidi ? getArcPoint(source, target, e.sourceNode) : undefined;
    const start = getIntersect(arc ?? target, source, e.sourceNode);
    const end = getEndPoint(arc ?? source, target, e, offset);
    const points = arc ? [start, arc, end] : [start, end];
    if (forceLtr && end[0] < start[0]) points.reverse();

    // const fn = generator;
    const fn = e.bidi ? generator.curve(curveNatural) : generator;
    return fn(points);
  };
}

function getArcPoint(
  source: [number, number],
  target: [number, number],
  node: BoxNode,
): [number, number] {
  const [x0, y0] = source;
  const [x2, y2] = target;
  const x1 = (x0 + x2) / 2;
  const y1 = (y0 + y2) / 2;
  const dx = x2 - x0;
  const dy = y2 - y0;
  const m = Math.abs(dx / dy);
  let d = num(node.width) * 0.75;
  if (x2 > x0) d *= -1;
  const dxa = d / Math.sqrt(1 + m * m);
  const dya = m * dxa;
  const xa = x1 + dxa;
  const ya = y1 + dya;
  return [xa, ya];
}

function getLoop(
  e: BoxEdge,
  offset: number,
  forceLtr: boolean,
): [number, number][] {
  const width = num(e.sourceNode.width);
  const height = num(e.sourceNode.height);
  const source: [number, number] = [
    num(e.sourceNode.x) + width - 1,
    num(e.sourceNode.y) + 1,
  ];
  const target: [number, number] = [
    num(e.sourceNode.x) + 1,
    num(e.sourceNode.y) + 1,
  ];
  const step1: [number, number] = [
    source[0] + width / 2,
    source[1] - height / 2,
  ];
  const step2: [number, number] = [
    target[0] - width / 2,
    target[1] - height / 2,
  ];
  const end = getOffset(target, step2, offset);
  const result = [source, step1, step2, end];
  if (forceLtr) result.reverse();
  return result;
}

function getEndPoint(
  source: [number, number],
  target: [number, number],
  e: BoxEdge,
  offset: number,
): [number, number] {
  const intersect = getIntersect(source, target, e.targetNode);
  return getOffset(intersect, source, offset);
}

function getOffset(
  intersect: [number, number],
  source: [number, number],
  offset: number,
): [number, number] {
  const [ox, oy] = intersect;
  const [x0, y0] = source;
  const vx = x0 - ox;
  const vy = y0 - oy;
  const m = Math.sqrt(vx * vx + vy * vy);
  if (m === 0) return intersect;
  const ux = vx / m;
  const uy = vy / m;
  const nx = ox + ux * offset;
  const ny = oy + uy * offset;
  return [nx, ny];
}

function getIntersect(
  source: [number, number],
  target: [number, number],
  node: BoxNode,
): [number, number] {
  const [ox, oy] = source;
  const [x0, y0] = target;
  const vx = ox - x0;
  const vy = oy - y0;

  const dx = vx > 0 ? 1 : -1;
  const ex = x0 + (dx * (coalesce(node.width, 0) - 2)) / 2;
  const dy = vy > 0 ? 1 : -1;
  const ey = y0 + (dy * (coalesce(node.height, 0) - 2)) / 2;
  if (vx === 0) return [x0, ey];
  if (vy === 0) return [ex, y0];
  const tx = (ex - x0) / vx;
  const ty = (ey - y0) / vy;

  if (tx <= ty) return [ex, y0 + tx * vy];
  return [x0 + ty * vx, ey];
}

function getNodePoint(node: BoxNode): [number, number] {
  return [getNodeValue(node, 'x'), getNodeValue(node, 'y')];
}

function getNodeValue(node: BoxNode, type: 'x' | 'y'): number {
  const value = coalesce(node[type], 0);
  const diam = type === 'x' ? node.width : node.height;
  const offset = coalesce(diam, 0) / 2;
  return value + offset;
}
