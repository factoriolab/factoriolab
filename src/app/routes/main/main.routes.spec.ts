import { routes } from './main.routes';
import { DataModule } from './routes/data/data.module';
import { FlowComponent } from './routes/flow/flow.component';
import { ListComponent } from './routes/list/list.component';

describe('Main Routes', () => {
  it('should load child routes', async () => {
    expect(await routes[0].children![0].loadComponent!()).toEqual(
      ListComponent,
    );
    expect(await routes[0].children![1].loadComponent!()).toEqual(
      FlowComponent,
    );
    expect(await routes[0].children![2].loadChildren!()).toEqual(DataModule);
  });
});
