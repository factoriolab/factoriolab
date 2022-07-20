interface SimplexResult {
  pivots: number;
  result_type: number;
  tableau: Float64Array;
  time: number;
}

export class WasmUtility {
  static simplex(
    tableau: Float64Array,
    rows: number,
    timeout: number
  ): SimplexResult {
    return {
      pivots: 0,
      result_type: 0,
      tableau: tableau,
      time: 0,
    };
  }
}
