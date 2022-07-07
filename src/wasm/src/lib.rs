mod simplex;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn simplex(mut tableau: Box<[f64]>, rows: usize) -> Box<[f64]> {
    let cols = tableau.len() / rows;
    let pivots = simplex::simplex(&mut tableau, cols, rows);
    tableau[0] = pivots as f64;
    return tableau;
}
