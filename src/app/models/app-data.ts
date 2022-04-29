import { Mod, ModInfo } from './mod';

export interface AppData {
  app: Mod;
  base: ModInfo[];
  mods: ModInfo[];
  v0: string[];
  hash: string[];
}
