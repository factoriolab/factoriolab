import { Step } from './step';

export interface Node extends Step {
  id: number;
  name: string;
  children?: Step[];
}
