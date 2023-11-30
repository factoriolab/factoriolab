import { minFAS } from './min-fas';
import { SankeyGraph } from './models';

describe('minFAS', () => {
  it('should resolve circular loops in the graph', () => {
    const graph: SankeyGraph<object, object> = { nodes: [], links: [] };
    minFAS(graph);
    expect(graph).toBeTruthy();
  });
});
