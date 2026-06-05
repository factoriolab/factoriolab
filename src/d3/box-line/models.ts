import { ElkNode } from 'elkjs';

import { Link } from '~/flow/link';
import { Node } from '~/flow/node';

export type BoxNode = Node & ElkNode;
export type BoxEdge = Link & {
  id: string;
  sourceNode: BoxNode;
  targetNode: BoxNode;
};
