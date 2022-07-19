/* tslint:disable */
/* eslint-disable */
/**
* @param {Float64Array} tableau
* @param {number} rows
* @returns {SimplexResult}
*/
export function simplex(tableau: Float64Array, rows: number): SimplexResult;
/**
*/
export class SimplexResult {
  free(): void;
/**
*/
  pivots: number;
/**
*/
  result_type: number;
/**
*/
  tableau: Float64Array;
/**
*/
  time: number;
}
