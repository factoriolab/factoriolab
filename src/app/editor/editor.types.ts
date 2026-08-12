import { emptyModData, ModData } from '~/data/schema/mod-data';

export interface IconFileInfo {
  url: string;
  file: File;
}

export interface EditorData {
  data: ModData;
  icons: Partial<Record<string, IconFileInfo>>;
}

export function emptyEditorData(): EditorData {
  return {
    data: emptyModData(),
    icons: {},
  };
}
