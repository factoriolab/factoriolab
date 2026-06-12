import {
  IconData,
  IconJson,
  parseIcon,
  parseIconData,
} from '~/data/schema/icon-data';
import { toRecord } from '~/utils/record';

export const systemIcons: IconJson[] = [
  { id: 'transparent', x: 66, y: 0, color: '#000000' },
  { id: 'module', x: 132, y: 0, color: '#ffffff' },
  { id: 'pipe', x: 198, y: 0, color: '#6d644e' },
  { id: 'q-any', x: 264, y: 0, color: '#716d6f' },
  { id: 'captain-of-industry', x: 0, y: 66, color: '#aa5933' },
  { id: 'dyson-sphere-program', x: 66, y: 66, color: '#857e75' },
  { id: 'factor-y', x: 132, y: 66, color: '#657c4c' },
  { id: 'factorio', x: 198, y: 66, color: '#905b34' },
  { id: 'final-factory', x: 264, y: 66, color: '#45576a' },
  { id: 'foundry', x: 0, y: 132, color: '#f8b471' },
  { id: 'mindustry', x: 66, y: 132, color: '#a69890' },
  { id: 'outworld-station', x: 132, y: 132, color: '#67b3b6' },
  { id: 'satisfactory', x: 198, y: 132, color: '#8b9096' },
  { id: 'techtonica', x: 264, y: 132, color: '#977372' },
  { id: 'skyformer', x: 0, y: 198, color: '#d13d2b' },
  { id: 'custom', x: 66, y: 198, color: '#657a95' },
  { id: 'rocket-pod', x: 132, y: 198, color: '#504b42' },
  { id: 'mote-mancer', x: 198, y: 198, color: '#867a69' },
  { id: 'star-rupture', x: 264, y: 198, color: '#615f62' },
];

export const systemIconsRecord = toRecord(
  systemIcons.map(
    (i): IconData => parseIconData(parseIcon(i), 'icons/icons.webp'),
  ),
);
