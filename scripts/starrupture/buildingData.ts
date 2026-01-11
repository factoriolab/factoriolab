import { getJsonData } from '../helpers/file.helpers';

export type BdInfo = {
  id: string;
  path: string;
  iconObjectPath?: string | null;
  name?: string | null;
  nameRaw?: { localized?: string; source?: string; key?: string } | null;
  uiSubType?: string | null;
  uniqueName?: string | null;
};

export function parseBdFile(filePath: string): BdInfo {
  const raw = getJsonData(filePath) as any[];
  const id = filePath.split(/[\\/]/).pop()?.replace('.json', '') ?? '';
  const info: BdInfo = {
    id,
    path: filePath,
    iconObjectPath: null,
    name: null,
    nameRaw: null,
    uiSubType: null,
    uniqueName: null,
  };

  for (const obj of raw) {
    if (obj?.Type === 'CrBuildingData') {
      const props = obj?.Properties ?? {};
      const icon = props?.Icon?.ResourceObject?.ObjectPath;
      if (icon) info.iconObjectPath = icon;

      const bn = props?.BuildingName ?? {};
      info.nameRaw = {
        localized: bn?.LocalizedString ?? undefined,
        source: bn?.SourceString ?? undefined,
        key: bn?.Key ?? undefined,
      };
      info.name = bn?.LocalizedString ?? bn?.SourceString ?? bn?.Key ?? null;

      info.uiSubType = props?.UISubType ?? props?.UIType ?? null;
      info.uniqueName = props?.BuldingUniqueName ?? props?.BuildingID ?? null;

      // Found primary object, break
      break;
    }
  }

  return info;
}
