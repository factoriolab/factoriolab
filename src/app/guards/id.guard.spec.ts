import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { RouterService } from '~/services/router.service';
import { Mocks, TestModule } from '~/tests';

import { canActivateId } from './id.guard';

describe('canActivateId', () => {
  let router: Router;
  let routerSvc: RouterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [
        provideRouter([
          {
            path: ':id',
            canActivate: [canActivateId],
            children: [
              {
                path: 'list',
                component: Mocks.MockComponent,
              },
            ],
          },
        ]),
      ],
    });

    router = TestBed.inject(Router);
    routerSvc = TestBed.inject(RouterService);
  });

  it('should migrate old states', async () => {
    await RouterTestingHarness.create('/list?p=coal*0.5&s=**0&v=10');
    expect(router.url).toEqual('/1.1/list?v=11&o=coal*0.5&odr=0');
  });

  it('should migrate old zip states', async () => {
    // This v10 zip state contains:
    // - 1 objective (product): GQ*40
    // - Excluded items including l, Do, Gd, Fq, etc.
    // - Recipe settings with module/beacon configurations
    // - Machine rank: O~A~D, Module rank: L~U, Beacon: 4
    // - Display rate: per second (0)
    await RouterTestingHarness.create(
      '/list?z=eJxFkctuwjAURP8mi1lUcUiALliQp3FKIRIBqZur0idVKQUKhS749t6RAkjx0dj3NXa-iwqh7y1DzKWtK0AtLV0GU-FXC2ZiIsy8FyO-IBJ0NNhF7M3H3uITRtKVonhW5GvFfUC8KcpfRTZVxNzGMbeMJjkraqpCMeI27rLVrcJVjA6JkhixbMLkd8WA0aTDACuSNgf9MRCygSUcMWCrCMbbFF.MpstyrqgOwAo-fCmfABg9sjfAUYYPlBHrdk2xOPp1bO2OxJ44EBzsaMG1CFpw7OV4a0eDlgHLWtvRQcHJp48lfdCmG1OVlxtvNMc.cV6xvUjbV9k6hZIdG1GchRs1InfnUHQWP9d5u4tMP4BUqoleX.IFsAZPbdw8QpZcMrPsKvOrLK6tHvnifJGMf9XSSg-BVAGYI3YM9MVWwFKqP54Z77WHu1ONUEbSRxstSb2tOkDp7Y3.D1ymp-M_&v=10',
    );

    // Verify route was migrated to the correct mod
    expect(router.url).toContain('/sxp/list');

    // Decompress the output URL to verify migrated state
    const queryStr = router.url.split('?')[1];
    const params: Record<string, string> = {};
    for (const part of queryStr.split('&')) {
      const [key, ...rest] = part.split('=');
      params[key] = rest.join('=');
    }
    const state = await routerSvc.unzipQueryParams(params);

    // Version migrated from 10 to 11
    expect(state['v']).toEqual('11');

    // Objective migrated from v10 'p' field
    expect(state['o']).toEqual('GQ*40');

    // Display rate migrated (0 = per second)
    expect(state['odr']).toEqual('0');

    // Machine/module/beacon ranks preserved
    expect(state['mmr']).toEqual('O~A~D');
    expect(state['mer']).toEqual('L~U');
    expect(state['mbe']).toEqual('4');

    // Machine settings preserved
    expect(state['m']).toEqual('A*6*3');

    // Excluded items preserved — all original v10 items present
    const excludedItems = new Set(state['i'] as string[]);
    const expectedItems = [
      'l',
      'Do',
      'Gd',
      'Fq',
      'N2',
      'Ng',
      'Kw',
      'EV',
      'Bg',
      'BB',
      'E2',
      'CF',
      'GU',
      'CG',
      'OF',
      'B8',
      'D9',
      'JQ',
      'GM',
      'GK',
      'GO',
      'ET',
      'Ch',
      'IQ',
      'C7',
      'G8',
      'C6',
      'Kz',
      'I4',
      'DH',
      'DJ',
      'DI',
      'J5',
    ];
    for (const id of expectedItems) expect(excludedItems.has(id)).toBeTrue();

    // Recipe settings preserved — key entries from the original v10 state present
    const recipes = new Set(state['r'] as string[]);
    const expectedRecipes = [
      'Gn',
      'Go',
      'Kb', // Simple excluded recipes
      'Qx*o*0*0', // Recipe with module/beacon overrides
      'Kc**1*1',
      'H.*y',
      'Da',
      'Iy',
      'EB', // More simple recipes
    ];
    for (const r of expectedRecipes) expect(recipes.has(r)).toBeTrue();
  });

  it('should migrate old game shortcuts', async () => {
    const rth = await RouterTestingHarness.create('/factorio');
    expect(router.url).toEqual('/spa');
    await rth.navigateByUrl('/final-factory');
    expect(router.url).toEqual('/ffy');
    await rth.navigateByUrl('/foundry');
    expect(router.url).toEqual('/fdy');
    await rth.navigateByUrl('/outworld-station');
    expect(router.url).toEqual('/ows');
    await rth.navigateByUrl('/satisfactory');
    expect(router.url).toEqual('/sfy');
    await rth.navigateByUrl('/techtonica');
    expect(router.url).toEqual('/tta');
  });
});
