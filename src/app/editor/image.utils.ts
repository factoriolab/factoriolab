import { ModData } from '~/data/schema/mod-data';

import { EditorData } from './editor.types';

export async function splitIcons(
  url: string,
  data: ModData,
): Promise<EditorData> {
  return new Promise((res, rej) => {
    const editorData: EditorData = { data, icons: {} };
    const image = new Image();
    image.onload = (): void => {
      let i = 0;
      for (const icon of data.icons) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        if (context == null) {
          rej(new Error('Failed to get 2d canvas context'));
          return;
        }

        context.drawImage(image, icon.x, icon.y, 64, 64, 0, 0, 64, 64);
        canvas.toBlob((blob) => {
          if (blob != null) {
            const file = new File([blob], `${icon.id}.webp`, {
              type: 'image/webp',
            });
            const url = URL.createObjectURL(file);
            editorData.icons[icon.id] = {
              file,
              url,
            };
          }

          i++;
          if (i === data.icons.length) res(editorData);
        });
      }
    };
    image.src = url;
  });
}
