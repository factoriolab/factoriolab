import { Quality } from './quality';

export type TechnologyEffect =
  | BeltStackBonus
  | InserterBonus
  | MiningBonus
  | QualityUnlock
  | RecipeUnlock
  | ResearchProductivityBonus
  | ResearchSpeedBonus;

export interface BeltStackBonus {
  type: 'belt-stack';
  value: number;
}

export interface InserterBonus {
  type: 'inserter';
  id: string;
  value: number;
}

export interface MiningBonus {
  type: 'mining';
  value: number;
}

export interface QualityUnlock {
  type: 'quality';
  value: Quality;
}

export interface RecipeUnlock {
  type: 'recipe';
  id: string;
}

export interface ResearchProductivityBonus {
  type: 'research-productivity';
  value: number;
}

export interface ResearchSpeedBonus {
  type: 'research-speed';
  value: number;
}

export interface RecipeProductivityBonus {
  type: 'recipe-productivity';
  id: string;
  value: number;
}
