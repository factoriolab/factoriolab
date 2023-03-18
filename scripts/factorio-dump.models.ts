export interface Item {
  type: string;
}

export interface Modifier {
  type: string;
}

export function isUnlockRecipeModifier(
  modifier: Modifier
): modifier is UnlockRecipeModifier {
  return modifier.type === 'unlock-recipe';
}

export interface UnlockRecipeModifier extends Modifier {
  type: 'unlock-recipe';
  recipe: string;
}

export interface Technology {
  type: 'technology';
  name: string;
  effects?: Modifier[];
}

export interface DataRawDump {
  item: Record<string, Item>;
  technology: Record<string, Technology>;
}

export interface Locale {
  names: Record<string, string>;
}
