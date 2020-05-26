import { Step } from './step';

export interface Node extends Step {
  id: string;
  name: string;
  children?: Node[];
}
