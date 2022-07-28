import { Injectable } from '@angular/core';
import { fromEvent, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResponsiveService {
  width$ = fromEvent(window, 'resize').pipe(
    map((ev: any) => ev.target.innerWidth),
    startWith(window.innerWidth)
  );
}
