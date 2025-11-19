import { Game } from '~/data/game';
import { ModInfo } from '~/data/mod';
import { Option } from '~/option/option';
import { toRecord } from '~/utils/record';

export const DEFAULT_MOD = 'spa';

export interface Datasets {
  mods: ModInfo[];
  modHashV0: (string | null)[];
  modHash: (string | null)[];
}

export const datasets: Datasets = {
  mods: [
    { id: 'spa', name: 'Space Age', game: 'factorio' },
    { id: '2.0', name: '2.0', game: 'factorio' },
    { id: '2.0q', name: '2.0 + Quality', game: 'factorio' },
    { id: '1.1', name: '1.1', game: 'factorio' },
    { id: '1.1e', name: '1.1 Expensive', game: 'factorio' },
    { id: '1.0', name: '1.0', game: 'factorio' },
    { id: 'aai', name: 'AAI Industry', game: 'factorio' },
    { id: 'bob', name: "Bob's Mods", game: 'factorio' },
    { id: 'bobang', name: "Bob's & Angel's", game: 'factorio' },
    { id: 'ir3', name: 'Industrial Revolution 3', game: 'factorio' },
    { id: 'kr2', name: 'Krastorio 2', game: 'factorio' },
    { id: 'kr2sxp', name: 'Krastorio 2 + SE', game: 'factorio' },
    { id: 'nls', name: 'Nullius', game: 'factorio' },
    { id: 'pys', name: 'Pyanodons', game: 'factorio' },
    { id: 'pysalf', name: 'Pyanodons + AL', game: 'factorio' },
    { id: 'sea', name: 'Sea Block', game: 'factorio' },
    { id: 'sxp', name: 'Space Exploration', game: 'factorio' },
    { id: 'dsp', name: 'Dyson Sphere Program', game: 'dyson-sphere-program' },
    { id: 'sfy', name: 'Satisfactory', game: 'satisfactory' },
    { id: 'coi', name: 'Captain of Industry', game: 'captain-of-industry' },
    { id: 'tta', name: 'Techtonica', game: 'techtonica' },
    { id: 'ffy', name: 'Final Factory', game: 'final-factory' },
    { id: 'fay', name: 'Factor Y', game: 'factor-y' },
    { id: 'mds', name: 'Serpulo', game: 'mindustry' },
    { id: 'mde', name: 'Erekir', game: 'mindustry' },
    { id: 'fdy', name: 'Foundry', game: 'foundry' },
    { id: 'ows', name: 'Outworld Station', game: 'outworld-station' },
    { id: 'sky', name: 'SkyFormer', game: 'skyformer' },
    { id: 'cst', name: 'Custom', game: 'custom' },
  ],
  modHashV0: [
    '1.1',
    '1.0',
    null,
    null,
    null,
    'bobs',
    'bobs-angels',
    'dsp',
    null,
    null,
    'krastorio2',
    'krastorio2+se',
    'pyanodons',
    'pyanodons+al',
    'seablock',
    'space-exploration',
    null,
  ],
  modHash: [
    '1.1',
    '1.0',
    null,
    null,
    null,
    'bob',
    'bobang',
    'dsp',
    null,
    null,
    'kr2',
    'kr2sxp',
    'pys',
    'pysalf',
    'sea',
    'sxp',
    null,
    'nls',
    null,
    null,
    null,
    'sfy',
    'coi',
    null,
    '1.1e',
    null,
    null,
    null,
    'aai',
    'ir3',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    'tta',
    null,
    'ffy',
    'fay',
    null,
    null,
    null,
    '2.0',
    '2.0q',
    'mds',
    'mde',
    'fdy',
    'ows',
    'spa',
    'sky',
  ],
};

export const modRecord = toRecord(datasets.mods);

export function modOptions(game: Game): Option[] {
  return datasets.mods
    .filter((m) => m.game === game)
    .map((m): Option => ({ label: m.name, value: m.id }));
}
