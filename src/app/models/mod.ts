import { ModData, AppModData } from './data';
import { Game } from './enum';

export interface ModInfo {
  /**
   * Do not use the colon (:) character in ID.
   * ID must match the folder name of the mod inside the data folder.
   */
  id: string;
  name: string;
  game: Game;
  compatibleIds?: string[];
}

export interface Mod extends ModData, ModInfo {}
export interface AppMod extends AppModData, ModInfo {}
