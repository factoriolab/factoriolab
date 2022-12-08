import { routes } from './main-routing.module';
import { FlowModule } from './routes/flow/flow.module';
import { ListModule } from './routes/list/list.module';
import { MatrixModule } from './routes/matrix/matrix.module';

describe('Main Routing', () => {
  it('should load child modules', async () => {
    expect(await routes[0].children![0].loadChildren!()).toEqual(ListModule);
    expect(await routes[0].children![1].loadChildren!()).toEqual(FlowModule);
    expect(await routes[0].children![2].loadChildren!()).toEqual(MatrixModule);
  });
});
