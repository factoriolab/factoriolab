export function slugify(raw: string): string {
  return raw.replace(/^DA_/, '').replace(/([A-Z])/g, (m) => '-' + m.toLowerCase()).replace(/^-/, '');
}

export function makeMachineEntry(p: any, id: string, name: string, speed: number, category: string, iconId: string) {
  const machine: any = { speed };
  if (p.da.electricityValue != null) machine.drain = p.da.electricityValue;
  if (p.da.coolingCapacity != null) machine.heat = p.da.coolingCapacity;
  machine.modules = 0;
  return {
    category,
    id,
    name,
    row: 0,
    machine,
    icon: iconId,
  };
}

export function makeBeltEntry(p: any, id: string, name: string, speed: number, category: string, iconId: string) {
  return {
    category,
    id,
    name,
    row: 0,
    belt: { speed },
    icon: iconId,
  };
}

export function computeCargoRate(railRate: number, delay: number, stack: number = 100) {
  // Simulated rate (items/s) = stack / ((stack / railRate) + delay)
  if (!railRate || railRate <= 0) return 0;
  return Number((stack / ((stack / railRate) + delay)).toFixed(6));
}

export function expandProducersForPurity(producers: string[], purityBases: Set<string>, itemsPresent: Set<string>) {
  if (!producers || producers.length === 0) return producers;
  const expanded: string[] = [];
  for (const p of producers) {
    if (purityBases.has(p) && itemsPresent.has(p)) {
      expanded.push(p, `${p}-impure`, `${p}-pure`);
    } else {
      expanded.push(p);
    }
  }
  const seen = new Set<string>();
  return expanded.filter((s) => {
    if (seen.has(s)) return false;
    seen.add(s);
    return true;
  });
}


