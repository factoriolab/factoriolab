fn pivot(
    tableau: &mut Box<[f64]>,
    cols: usize,
    rows: usize,
    col_num: usize,
    row_num: usize,
) -> bool {
    // Multiply pivot row by reciprocal of pivot element
    let row_start = row_num * cols;
    let cell_pivot = row_start + col_num;
    let val = tableau[cell_pivot];
    let reciprocal = 1.0 / val;
    for cell_mult in row_start..(row_start + cols) {
        tableau[cell_mult] = tableau[cell_mult] * reciprocal;
    }

    // Subtract multiples of pivot row to other rows to change pivot column to 0
    for r in 0..rows {
        let row_iter_start = r * cols;
        let cell_row = row_iter_start + col_num;
        // Skip pivot row and 0 cells
        if r != row_num && tableau[cell_row] != 0.0 {
            let factor = tableau[cell_row];
            for c in 0..cols {
                let cell_mult = row_start + c;
                let cell_sub = row_iter_start + c;
                let sub_amt = tableau[cell_mult] * factor;
                tableau[cell_sub] = tableau[cell_sub] - sub_amt;
            }
        }
    }

    return true;
}

fn pivot_col(tableau: &mut Box<[f64]>, cols: usize, rows: usize, col_num: usize) -> bool {
    // Determine which row to pivot
    let col_cost = cols - 1;
    let mut row_unset = true;
    let mut row_num = 0;
    let mut row_val = 0.0;
    for r in 0..rows {
        let row_start = r * cols;
        let cell_comp = row_start + col_num;
        if tableau[cell_comp] > 0.0 {
            let cell_cost = row_start + col_cost;
            let ratio = tableau[cell_cost] / tableau[cell_comp];
            if row_unset || ratio < row_val {
                row_unset = false;
                row_num = r;
                row_val = ratio;
            }
        }
    }

    if row_unset {
        // Couldn't find a row to pivot
        return false;
    }

    return pivot(tableau, cols, rows, col_num, row_num);
}

pub fn simplex(tableau: &mut Box<[f64]>, cols: usize, rows: usize) -> usize {
    let mut pivots = 0;
    loop {
        pivots += 1;

        // Determine which column to pivot
        let mut col_num = 0;
        for c in 1..cols {
            if tableau[c] < tableau[col_num] {
                col_num = c;
            }
        }

        if tableau[col_num] >= 0.0 {
            // No columns below zero, solution found
            break;
        }

        if !pivot_col(tableau, cols, rows, col_num) {
            // Failed to pivot column
            return 0;
        }
    }

    return pivots;
}
