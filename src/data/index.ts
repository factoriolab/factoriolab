import { AppData } from '~/models';
import app from './app/data.json';

export { app };
export const data: AppData = {
  app,
  base: [
    { id: '1.0', name: '1.0.0' },
    { id: '0.18', name: '0.18.47' },
    { id: '0.17', name: '0.17.79' },
    { id: '0.16', name: '0.16.51' },
    { id: 'bio-industries', name: 'Bio Industries' },
    { id: 'bobs-angels', name: 'Bobs & Angels' },
    { id: 'factorio-extended-plus', name: 'FactorioExtended Plus' },
    { id: 'krastorio2', name: 'Krastorio 2' },
    { id: 'pyanodons', name: 'Pyanodons' },
  ],
  mods: [
    {
      id: 'research',
      name: 'Infinite Research',
      compatibleIds: ['1.0', '0.18', '0.17', '0.16', 'factorio-extended-plus'],
    },
  ],
};
