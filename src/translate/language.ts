import { Option } from '~/option/option';

export type Language = 'en' | 'zh' | 'de' | 'fr' | 'ru' | 'ja' | 'pt-BR';

export const languageOptions: Option<Language>[] = [
  { label: 'English', value: 'en' },
  { label: '简体中文 (Chinese)', value: 'zh' },
  { label: 'Français (French)', value: 'fr' },
  { label: 'Deutsch (German)', value: 'de' },
  { label: '日本語 (Japanese)', value: 'ja' },
  { label: 'Português (Portuguese)', value: 'pt-BR' },
  { label: 'русский (Russian)', value: 'ru' },
];
