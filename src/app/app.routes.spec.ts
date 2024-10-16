import { routes } from './app.routes';
import { IdComponent } from './routes/id.component';
import { LandingComponent } from './routes/landing/landing.component';
import { routes as mainRoutes } from './routes/main/main.routes';
import { WizardComponent } from './routes/wizard/wizard.component';

describe('App Routes', () => {
  it('should load id route', async () => {
    expect(await routes[0].loadComponent!()).toEqual(IdComponent);
  });

  it('should load child routes', async () => {
    expect(await routes[0].children![0].loadComponent!()).toEqual(
      WizardComponent,
    );
    expect(await routes[0].children![2].loadComponent!()).toEqual(
      LandingComponent,
    );
    expect(await routes[0].children![3].loadChildren!()).toEqual(mainRoutes);
  });
});
