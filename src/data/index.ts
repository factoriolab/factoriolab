import { AppData } from '~/models';
import app from './app/data.json';

export { app };
export const data: AppData = {
  app,
  base: [
    { id: '1.1', name: '1.1.2' },
    { id: '1.0', name: '1.0.0' },
    { id: '0.17', name: '0.17.79' },
    { id: '0.16', name: '0.16.51' },
    { id: 'bio-industries', name: 'Bio Industries' },
    { id: 'bobs', name: 'Bob\'s Mods' },
    { id: 'bobs-angels', name: 'Bob\'s & Angel\'s' },
    { id: 'factorio-extended-plus', name: 'FactorioExtended Plus' },
    { id: 'krastorio2', name: 'Krastorio 2' },
    { id: 'krastorio2+se', name: 'Krastorio 2 + SE' },
    { id: 'pyanodons', name: 'Pyanodons' },
    { id: 'seablock', name: 'Sea Block' },
    { id: 'space-exploration', name: 'Space Exploration' },
    { id: 'xander', name: 'Xander Mod' },
  ],
  mods: [
    {
      id: 'research',
      name: 'Infinite Research',
      compatibleIds: [
        '1.1',
        '1.0',
        '0.18',
        '0.17',
        '0.16',
        'factorio-extended-plus',
      ],
    },
  ],
};
