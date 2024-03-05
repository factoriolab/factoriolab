import { SelectItem } from 'primeng/api';

export enum Language {
  English = 'en',
  Chinese = 'zh',
  German = 'de',
  French = 'fr',
}

export const languageOptions: SelectItem<Language>[] = [
  { label: 'English', value: Language.English },
  { label: '简体中文', value: Language.Chinese },
  { label: 'Deutsch', value: Language.German },
  { label: 'Français', value: Language.French },
];
