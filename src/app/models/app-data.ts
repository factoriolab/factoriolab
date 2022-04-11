import { ModInfo, Mod, AppMod } from './mod';

export interface AppData {
  app: AppMod;
  base: ModInfo[];
  mods: ModInfo[];
  v0: string[];
  hash: string[];
}
