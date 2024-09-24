// import { TestBed } from '@angular/core/testing';
// import { provideRouter, Router } from '@angular/router';
// import { RouterTestingHarness } from '@angular/router/testing';

// import { Mocks, TestModule } from '~/tests';

// import { canActivateLanding } from './landing.guard';

// describe('canActivateLanding', () => {
//   let router: Router;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [TestModule],
//       providers: [
//         provideRouter([
//           {
//             path: 'urltree',
//             component: Mocks.MockComponent,
//           },
//           {
//             path: ':id',
//             children: [
//               {
//                 path: 'list',
//                 component: Mocks.MockComponent,
//               },
//               {
//                 path: '',
//                 pathMatch: 'full',
//                 canActivate: [canActivateLanding],
//                 component: Mocks.MockComponent,
//               },
//             ],
//           },
//           {
//             path: '',
//             pathMatch: 'full',
//             canActivate: [canActivateLanding],
//             component: Mocks.MockComponent,
//           },
//         ]),
//       ],
//     });

//     router = TestBed.inject(Router);
//   });

//   it('should load the last saved state', async () => {
//     mockStore.overrideSelector(selectBypassLanding, true);
//     mockStore.refreshState();
//     spyOnProperty(BrowserUtility, 'routerState').and.returnValue('/urltree');
//     await RouterTestingHarness.create('/');
//     expect(router.url).toEqual('/urltree');
//   });

//   it('should navigate to the list', async () => {
//     mockStore.overrideSelector(selectBypassLanding, true);
//     mockStore.refreshState();
//     await RouterTestingHarness.create('/?v=6');
//     expect(router.url).toEqual('/1.1/list?v=6');
//   });

//   it('should allow navigating to the landing page', async () => {
//     mockStore.overrideSelector(selectBypassLanding, false);
//     mockStore.refreshState();
//     await RouterTestingHarness.create('/');
//     expect(router.url).toEqual('/');
//   });
// });
