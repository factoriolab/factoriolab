// istanbul ignore file
// This file is used to mock the WASM module during testing
// For unknown reasons, using the real WASM module during testing results in Jasmine errors

interface SimplexResult {
  free: () => void;
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
      free: (): void => {},
      pivots: 0,
      result_type: 0,
      tableau: tableau,
      time: 0,
    };
  }
}
