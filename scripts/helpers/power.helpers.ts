export function getEnergyInMJ(usage: string): number {
  const match = /(\d*\.?\d*)(\w*)/.exec(usage);
  if (match == null) throw new Error(`Unrecognized energy format: '${usage}'`);

  const [_, numStr, unit] = [...match];
  if (!unit.endsWith('J'))
    throw new Error(`Unrecognized energy unit: '${usage}'`);

  const multiplier = getMultiplier(unit.substring(0, unit.length - 1)) / 1000;
  const num = Number(numStr);
  const result = multiplier * num;
  return round(result, 10);
}

export function getMultiplier(letter: string): number {
  switch (letter) {
    case '':
      return 0.001;
    case 'k':
    case 'K':
      return 1;
    case 'M':
      return 1000;
    case 'G':
      return 1000000;
    case 'T':
      return 1000000000;
    default:
      throw new Error(`Unsupported multiplier: '${letter}'`);
  }
}

export function getPowerInKw(usage: string): number | undefined {
  const match = /(\d*\.?\d*)(\w*)/.exec(usage);
  if (match == null) throw new Error(`Unrecognized power format: '${usage}'`);

  const [_, numStr, unit] = [...match];
  if (!unit.endsWith('W')) return undefined;

  const multiplier = getMultiplier(unit.substring(0, unit.length - 1));
  const num = Number(numStr);
  return multiplier * num;
}

export function round(number: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(number * factor) / factor;
}
