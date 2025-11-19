import { Game } from './game';
// import { ModData } from './schema/mod-data';

export interface ModInfo {
  /**
   * Do not use the colon (:) character in ID.
   * ID must match the folder name of the mod inside the data folder.
   */
  id: string;
  name: string;
  game: Game;
}

// export interface Mod extends ModData, ModInfo {}
