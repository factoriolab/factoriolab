import { routes } from './app-routing.module';
import { FlowModule } from './routes/main/routes/flow/flow.module';
import { ListModule } from './routes/main/routes/list/list.module';
import { MatrixModule } from './routes/main/routes/matrix/matrix.module';

describe('App Routing', () => {
  it('should load child modules', async () => {
    expect(await routes[0].loadChildren!()).toEqual(ListModule);
    expect(await routes[1].loadChildren!()).toEqual(FlowModule);
    expect(await routes[2].loadChildren!()).toEqual(MatrixModule);
  });
});
