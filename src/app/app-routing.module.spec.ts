import { routes } from './app-routing.module';
import { LandingModule } from './routes/landing/landing.module';
import { MainModule } from './routes/main/main.module';
import { WizardModule } from './routes/wizard/wizard.module';

describe('App Routing', () => {
  it('should load child modules', async () => {
    expect(await routes[0].loadChildren!()).toEqual(WizardModule);
    expect(await routes[1].loadChildren!()).toEqual(LandingModule);
    expect(await routes[2].loadChildren!()).toEqual(MainModule);
  });
});
