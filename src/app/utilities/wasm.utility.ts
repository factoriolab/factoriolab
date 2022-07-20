// istanbul ignore file
// Simple wrapper for WASM module that can be mocked during tests
// For unknown reasons, using the real WASM module during testing results in Jasmine errors

import * as wasm from '../vendor/factoriolab_simplex';

export class WasmUtility {
  static simplex = wasm.simplex;
}
