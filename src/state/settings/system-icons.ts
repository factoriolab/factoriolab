import {
  IconData,
  IconJson,
  parseIcon,
  parseIconData,
} from '~/data/schema/icon-data';
import { toRecord } from '~/utils/record';

export const systemIcons: IconJson[] = [
  { id: 'transparent', x: 66, y: 0 },
  { id: 'module', x: 132, y: 0 },
  { id: 'pipe', x: 198, y: 0 },
  { id: 'q-any', x: 264, y: 0 },
  { id: 'captain-of-industry', x: 0, y: 66 },
  { id: 'dyson-sphere-program', x: 66, y: 66 },
  { id: 'factor-y', x: 132, y: 66 },
  { id: 'factorio', x: 198, y: 66 },
  { id: 'final-factory', x: 264, y: 66 },
  { id: 'foundry', x: 0, y: 132 },
  { id: 'mindustry', x: 66, y: 132 },
  { id: 'outworld-station', x: 132, y: 132 },
  { id: 'satisfactory', x: 198, y: 132 },
  { id: 'techtonica', x: 264, y: 132 },
  { id: 'skyformer', x: 0, y: 198 },
  { id: 'custom', x: 66, y: 198 },
  { id: 'rocket-pod', x: 132, y: 198 },
];

export const systemIconsRecord = toRecord(
  systemIcons.map(
    (i): IconData => parseIconData(parseIcon(i), 'icons/icons.webp'),
  ),
);
