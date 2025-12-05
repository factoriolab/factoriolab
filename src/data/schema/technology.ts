import { TechnologyEffect } from './technology-effect';

export interface TechnologyJson {
  prerequisites?: string[];
  unlockedRecipes?: string[];

  // IDs of recipes that get a 10% productivity bonus for every level of this technology
  prodUpgrades?: string[];

  effects?: TechnologyEffect[];
}
