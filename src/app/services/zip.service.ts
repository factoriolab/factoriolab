import { inject, Injectable } from '@angular/core';

import {
  DisplayRate,
  rational,
  Rational,
  ZARRAYSEP,
  ZEMPTY,
  ZFALSE,
  ZFIELDSEP,
  Zip,
  ZLISTSEP,
  ZNULL,
  ZTRUE,
} from '~/models';
import { CompressionService } from './compression.service';

@Injectable({
  providedIn: 'root',
})
export class ZipService {
  compressionSvc = inject(CompressionService);

  zipList(list: Zip[]): Zip {
    return {
      bare: encodeURIComponent(list.map((i) => i.bare).join(ZLISTSEP)),
      hash: list.map((i) => i.hash).join(ZLISTSEP),
    };
  }

  zipFields(fields: string[]): string {
    return fields.join(ZFIELDSEP).replace(/\**$/, '');
  }

  zipTruthyString(value: string | undefined): string {
    return value == null ? '' : value;
  }

  zipTruthyNumber(value: number | Rational | undefined): string {
    return value == null ? '' : value.toString();
  }

  zipTruthyBool(value: boolean | undefined): string {
    return value == null ? '' : value ? ZTRUE : ZFALSE;
  }

  zipTruthyArray(value: string[] | number[] | undefined): string {
    return value == null ? '' : value.length ? value.join(ZARRAYSEP) : ZEMPTY;
  }

  zipTruthyNString(value: string | undefined, hash: string[]): string {
    return value == null ? '' : this.compressionSvc.nToId(hash.indexOf(value));
  }

  zipTruthyNArray(value: string[] | undefined, hash: string[]): string {
    return value == null
      ? ''
      : value.length
        ? value
            .map((v) => this.compressionSvc.nToId(hash.indexOf(v)))
            .join(ZARRAYSEP)
        : ZEMPTY;
  }

  zipDiffString(
    value: string | null | undefined,
    init: string | null | undefined,
  ): string {
    return value === init ? '' : value == null ? ZNULL : value;
  }

  zipDiffNumber(
    value: number | Rational | null | undefined,
    init: number | Rational | null | undefined,
  ): string {
    return value === init ? '' : value == null ? ZNULL : value.toString();
  }

  zipDiffNRational(
    value: Rational | null | undefined,
    init: Rational | null | undefined,
  ): string {
    return this.zipDiffNNumber(value?.toNumber(), init?.toNumber());
  }

  zipDiffRational(
    value: Rational | null | undefined,
    init: Rational | null | undefined,
  ): string {
    return (value == null ? init == null : init != null && value.eq(init))
      ? ''
      : value == null
        ? ZNULL
        : value.toString();
  }

  zipDiffDisplayRate(
    value: DisplayRate | undefined,
    init: DisplayRate | undefined,
  ): string {
    if (value === init) return '';

    switch (value) {
      case DisplayRate.PerSecond:
        return '0';
      case DisplayRate.PerMinute:
        return '1';
      case DisplayRate.PerHour:
        return '2';
      default:
        return ZNULL;
    }
  }

  zipDiffBool(value: boolean | undefined, init: boolean | undefined): string {
    return value === init ? '' : value == null ? ZNULL : value ? ZTRUE : ZFALSE;
  }

  zipDiffNullableArray(
    value: string[] | null | undefined,
    init: string[] | null | undefined,
  ): string {
    const zVal =
      value != null
        ? value.length > 0
          ? [...value].sort().join(ZARRAYSEP)
          : ZEMPTY
        : ZNULL;
    const zInit =
      init != null
        ? init.length > 0
          ? [...init].sort().join(ZARRAYSEP)
          : ZEMPTY
        : ZNULL;
    return zVal === zInit ? '' : zVal;
  }

  zipDiffNString(
    value: string | undefined,
    init: string | undefined,
    hash: string[],
  ): string {
    return value === init
      ? ''
      : value == null
        ? ZNULL
        : this.compressionSvc.nToId(hash.indexOf(value));
  }

  zipDiffNNumber(value: number | undefined, init: number | undefined): string {
    return value === init
      ? ''
      : value == null
        ? ZNULL
        : this.compressionSvc.nToId(value);
  }

  zipDiffNullableNArray(
    value: string[] | null | undefined,
    init: string[] | null | undefined,
    hash: string[],
  ): string {
    const zVal =
      value != null
        ? value.length > 0
          ? value
              .map((v) => this.compressionSvc.nToId(hash.indexOf(v)))
              .sort()
              .join(ZARRAYSEP)
          : ZEMPTY
        : ZNULL;
    const zInit =
      init != null
        ? init.length > 0
          ? init
              .map((v) => this.compressionSvc.nToId(hash.indexOf(v)))
              .sort()
              .join(ZARRAYSEP)
          : ZEMPTY
        : ZNULL;
    return zVal === zInit ? '' : zVal;
  }

  parseString(value: string | undefined, hash?: string[]): string | undefined {
    if (hash != null) return this.parseNString(value, hash);
    if (!value?.length || value === ZNULL) return undefined;
    return value;
  }

  parseBool(value: string | undefined): boolean | undefined {
    if (!value?.length || value === ZNULL) return undefined;
    return value === ZTRUE;
  }

  parseNumber(
    value: string | undefined,
    useNNumber = false,
  ): number | undefined {
    if (useNNumber) return this.parseNNumber(value);
    if (!value?.length || value === ZNULL) return undefined;
    return Number(value);
  }

  parseRational(
    value: string | undefined,
    useNNumber = false,
  ): Rational | undefined {
    if (useNNumber) return rational(this.parseNNumber(value));
    if (!value?.length || value === ZNULL) return undefined;
    return rational(value);
  }

  parseDisplayRate(value: string | undefined): DisplayRate | undefined {
    if (!value?.length || value === ZNULL) return undefined;

    switch (value) {
      case '0':
        return DisplayRate.PerSecond;
      case '1':
        return DisplayRate.PerMinute;
      case '2':
        return DisplayRate.PerHour;
      default:
        return undefined;
    }
  }

  parseArray(value: string | undefined, hash?: string[]): string[] | undefined {
    if (hash) return this.parseNArray(value, hash);
    if (!value?.length || value === ZNULL) return undefined;
    return value === ZEMPTY ? [] : value.split(ZARRAYSEP);
  }

  parseNullableArray(
    value: string | undefined,
    hash?: string[],
  ): string[] | null | undefined {
    if (hash) return this.parseNullableNArray(value, hash);
    if (!value?.length) return undefined;
    if (value === ZNULL) return null;
    return value === ZEMPTY ? [] : value.split(ZARRAYSEP);
  }

  parseNString(value: string | undefined, hash: string[]): string | undefined {
    const v = this.parseString(value);
    if (v == null) return v;
    return hash[this.compressionSvc.idToN(v)];
  }

  parseNNumber(value: string | undefined): number | undefined {
    if (!value?.length || value === ZNULL) return undefined;
    return this.compressionSvc.idToN(value);
  }

  parseNArray(value: string | undefined, hash: string[]): string[] | undefined {
    const v = this.parseArray(value);
    if (v == null) return v;
    return v.map((a) => hash[this.compressionSvc.idToN(a)]);
  }

  parseNullableNArray(
    value: string | undefined,
    hash: string[],
  ): string[] | null | undefined {
    const v = this.parseNullableArray(value);
    if (v == null) return v;
    return v.map((a) => hash[this.compressionSvc.idToN(a)]);
  }
}
