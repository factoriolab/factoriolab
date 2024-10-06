import { ModData } from './data/mod-data';
import { Game } from './enum/game';

export interface ModInfo {
  /**
   * Do not use the colon (:) character in ID.
   * ID must match the folder name of the mod inside the data folder.
   */
  id: string;
  name: string;
  game: Game;
}

export interface Mod extends ModData, ModInfo {}
