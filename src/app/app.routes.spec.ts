import { routes } from './app.routes';
import { LandingComponent } from './routes/landing/landing.component';
import { MainModule } from './routes/main/main.module';
import { WizardComponent } from './routes/wizard/wizard.component';

describe('App Routes', () => {
  it('should load child routes', async () => {
    expect(await routes[0].loadComponent!()).toEqual(WizardComponent);
    expect(await routes[1].loadComponent!()).toEqual(LandingComponent);
    expect(await routes[2].loadChildren!()).toEqual(MainModule);
  });
});
