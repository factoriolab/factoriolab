import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, fromEvent, map, Observable, startWith } from 'rxjs';

import { Theme } from '~/models';
import { LabState, Preferences, Settings } from '~/store';

const LAB_ICON_STYLE_ID = 'lab-icon-css';
const LAB_THEME_STYLE_ID = 'lab-theme-css';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  theme$: Observable<Theme.Light | Theme.Dark>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private store: Store<LabState>
  ) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const prefersDark$ = fromEvent<MediaQueryList>(prefersDark, 'change').pipe(
      startWith(prefersDark),
      map((list) => list.matches)
    );

    this.theme$ = combineLatest([
      this.store.select(Preferences.getTheme),
      prefersDark$,
    ]).pipe(
      map(([theme, prefersDark]) => {
        if (theme === Theme.System) {
          // Don't need to test media query specifically
          // istanbul ignore next
          return prefersDark ? Theme.Dark : Theme.Light;
        }

        return theme;
      })
    );
  }

  initialize(): void {
    this.store.select(Settings.getDataset).subscribe((data) => {
      // Generate .lab-icon::before css rules stylesheet
      const head = this.document.getElementsByTagName('head')[0];
      const old = this.document.getElementById(LAB_ICON_STYLE_ID);
      if (old) {
        head.removeChild(old);
      }
      const style = this.document.createElement('style');
      style.id = LAB_ICON_STYLE_ID;
      let css = '';
      data.iconIds.forEach((i) => {
        const icon = data.iconEntities[i];
        css += `.${i}::before { background-image: url("${icon.file}"); background-position: ${icon.position}; } `;
      });
      data.itemIds
        .filter((i) => data.itemEntities[i].icon)
        .forEach((i) => {
          const icon = data.iconEntities[data.itemEntities[i].icon!];
          css += `.${i}.item::before { background-image: url("${icon.file}"); background-position: ${icon.position}; } `;
        });
      data.recipeIds
        .filter((i) => data.recipeEntities[i].icon)
        .forEach((i) => {
          const icon = data.iconEntities[data.recipeEntities[i].icon!];
          css += `.${i}.recipe::before { background-image: url("${icon.file}"); background-position: ${icon.position}; } `;
        });
      style.innerText = css;
      head.appendChild(style);
    });

    this.theme$.subscribe((theme) => {
      const themeLink = this.document.getElementById(
        LAB_THEME_STYLE_ID
      ) as HTMLLinkElement | null;
      if (themeLink) {
        if (theme === Theme.Dark) {
          // Dark theme
          themeLink.href = 'theme-dark.css';
        } else {
          // Light theme
          themeLink.href = 'theme-light.css';
        }
      }
    });
  }
}
