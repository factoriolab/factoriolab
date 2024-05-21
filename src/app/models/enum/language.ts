import { SelectItem } from 'primeng/api';

export enum Language {
  English = 'en',
  Chinese = 'zh',
  German = 'de',
  French = 'fr',
  Russian = 'ru',
  Japanese = 'ja',
}

export const languageOptions: SelectItem<Language>[] = [
  { label: 'English', value: Language.English },
  { label: '简体中文 (Chinese)', value: Language.Chinese },
  { label: 'Deutsch (German)', value: Language.German },
  { label: 'Français (French)', value: Language.French },
  { label: 'русский (Russian)', value: Language.Russian },
  { label: '日本語 (Japanese)', value: Language.Japanese },
];
