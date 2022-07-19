mod simplex;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen(getter_with_clone)]
pub struct SimplexResult {
    // 0 = Solved, 1 = Error, 2 = Timeout
    pub result_type: usize,
    pub pivots: usize,
    pub time: f64,
    pub tableau: Box<[f64]>,
}

#[wasm_bindgen]
pub fn simplex(mut tableau: Box<[f64]>, rows: usize, timeout: f64) -> SimplexResult {
    let cols = tableau.len() / rows;
    let (result_type, pivots, time) = simplex::simplex(&mut tableau, cols, rows, timeout);

    let result = SimplexResult {
        result_type: result_type,
        pivots: pivots,
        time: time,
        tableau: tableau.clone(),
    };

    return result;
}
