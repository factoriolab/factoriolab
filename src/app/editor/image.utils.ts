import chroma from 'chroma-js';
import { FastAverageColor } from 'fast-average-color';

import { IconData } from '~/data/schema/icon-data';
import { ModData } from '~/data/schema/mod-data';

import { EditorData, IconFileInfo } from './editor.types';

export async function splitIcons(
  url: string,
  data: ModData,
): Promise<EditorData> {
  const fac = new FastAverageColor();
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
        const average = fac.getColor(canvas).hex;
        const color = chroma(average).saturate().hex();
        canvas.toBlob((blob) => {
          if (blob != null) {
            const file = new File([blob], `${icon.id}.webp`, {
              type: 'image/webp',
            });
            const url = URL.createObjectURL(file);
            editorData.icons[icon.id] = {
              file,
              url,
              color,
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

export async function normalizeIcon(file: File): Promise<IconFileInfo> {
  const fac = new FastAverageColor();
  return new Promise((res, rej) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (context == null) {
      rej(new Error('Failed to get 2d canvas context'));
      return;
    }
    const image = new Image();
    image.onload = (): void => {
      const originalWidth = image.naturalWidth;
      const originalHeight = image.naturalHeight;
      if (originalWidth > originalHeight) {
        // Need to center vertically
        const dh = 64 * (originalHeight / originalWidth);
        const dy = (64 - dh) / 2;
        context.drawImage(image, 0, dy, 64, dh);
      } else if (originalHeight > originalWidth) {
        // Need to center horizontally
        const dw = 64 * (originalWidth / originalHeight);
        const dx = (64 - dw) / 2;
        context.drawImage(image, dx, 0, dw, 64);
      } else {
        context.drawImage(image, 0, 0, 64, 64);
      }

      const average = fac.getColor(image).hex;
      const color = chroma(average).saturate().hex();
      canvas.toBlob((blob) => {
        if (blob == null) {
          rej(new Error('Failed to create blob from canvas'));
          return;
        }

        const file = new File([blob], 'icon.webp', {
          type: 'image/webp',
        });
        const url = URL.createObjectURL(file);
        res({ file, url, color });
      });
    };
    image.src = URL.createObjectURL(file);
  });
}

export async function exportIcons(edit: EditorData): Promise<Blob | undefined> {
  return new Promise((res, rej) => {
    if (edit.data.icons.length === 0) res(undefined);
    const canvas = document.createElement('canvas');
    const arr = edit.data.icons
      .map((icon) => [icon, edit.icons[icon.id]])
      .filter((i): i is [IconData, IconFileInfo] => i[1] != null);
    const length = arr.length;
    const width = Math.ceil(Math.sqrt(length));
    const height = Math.ceil(length / width);
    const widthPx = width * 66 - 2;
    canvas.width = widthPx;
    canvas.height = height * 66 - 2;
    const context = canvas.getContext('2d');
    if (context == null) {
      rej(new Error('Failed to get 2d canvas context'));
      return;
    }

    Promise.all(arr.map(([_, info]) => createImageBitmap(info.file))).then(
      (images) => {
        let x = 0,
          y = 0;
        images.forEach((image, i) => {
          const [icon, info] = arr[i];
          context.drawImage(image, 0, 0, 64, 64, x, y, 64, 64);
          icon.x = x;
          icon.y = y;
          icon.color = icon.color || info.color;

          x += 66;
          if (x >= widthPx) {
            x = 0;
            y += 66;
          }
        });

        canvas.toBlob((blob) => {
          if (blob == null) {
            rej(new Error('Failed to create blob from canvas'));
            return;
          }

          res(blob);
        });
      },
      (err: unknown) => {
        rej(new Error(JSON.stringify(err)));
      },
    );
  });
}
