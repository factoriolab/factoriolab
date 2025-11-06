import { line } from 'd3';

import { coalesce } from '~/utils/nullish';

import { BoxEdge, BoxNode } from './models';

export function boxEdgeLine(
  offset = 5,
  forceLtr = false,
): (e: BoxEdge) => string | null {
  const generator = line();
  return (e: BoxEdge): string | null => {
    const source = getNodePoint(e.sourceNode);
    const target = getNodePoint(e.targetNode);
    const start = getIntersect(target, source, e.sourceNode);
    const end = getEndPoint(source, target, e, offset);
    if (forceLtr && end[0] < start[0]) return generator([end, start]);
    return generator([start, end]);
  };
}

function getEndPoint(
  source: [number, number],
  target: [number, number],
  e: BoxEdge,
  offset: number,
): [number, number] {
  const intersect = getIntersect(source, target, e.targetNode);
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
  const ex = x0 + (dx * coalesce(node.width, 0)) / 2;
  const dy = vy > 0 ? 1 : -1;
  const ey = y0 + (dy * coalesce(node.height, 0)) / 2;
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
