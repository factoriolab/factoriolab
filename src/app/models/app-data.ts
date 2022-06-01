import { Mod, ModInfo } from './mod';

export interface AppData {
  app: Mod;
  mods: ModInfo[];
  v0: string[];
  hash: string[];
}
