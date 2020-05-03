export interface Factory {
  speed: number;
  modules: number;
  /** Fuel consumption in kW */
  burner?: number;
  electric?: number;
  drain?: number;
}
