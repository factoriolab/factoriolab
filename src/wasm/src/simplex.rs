use js_sys::Date;

pub struct Matrix {
    pub tableau: Box<[f64]>,
    pub cols: usize,
    pub rows: usize,
}

fn pivot(matrix: &mut Matrix, col_num: usize, row_num: usize) -> bool {
    // Multiply pivot row by reciprocal of pivot element
    let row_start = row_num * matrix.cols;
    let cell_pivot = row_start + col_num;
    let val = matrix.tableau[cell_pivot];
    let reciprocal = 1.0 / val;
    for cell_mult in row_start..(row_start + matrix.cols) {
        matrix.tableau[cell_mult] = matrix.tableau[cell_mult] * reciprocal;
    }

    // Subtract multiples of pivot row to other rows to change pivot column to 0
    for r in 0..matrix.rows {
        let row_iter_start = r * matrix.cols;
        let cell_row = row_iter_start + col_num;
        // Skip pivot row and 0 cells
        if r != row_num && matrix.tableau[cell_row] != 0.0 {
            let factor = matrix.tableau[cell_row];
            for c in 0..matrix.cols {
                let cell_mult = row_start + c;
                let cell_sub = row_iter_start + c;
                let sub_amt = matrix.tableau[cell_mult] * factor;
                matrix.tableau[cell_sub] = matrix.tableau[cell_sub] - sub_amt;
            }
        }
    }

    return true;
}

fn pivot_col(matrix: &mut Matrix, col_num: usize) -> bool {
    // Determine which row to pivot
    let col_cost = matrix.cols - 1;
    let mut row_unset = true;
    let mut row_num = 0;
    let mut row_val = 0.0;
    for r in 0..matrix.rows {
        let row_start = r * matrix.cols;
        let cell_comp = row_start + col_num;
        if matrix.tableau[cell_comp] > 0.0 {
            let cell_cost = row_start + col_cost;
            let ratio = matrix.tableau[cell_cost] / matrix.tableau[cell_comp];
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

    return pivot(matrix, col_num, row_num);
}

pub fn simplex(matrix: &mut Matrix, timeout: f64) -> (usize, usize, f64) {
    let mut pivots = 0;
    let check = timeout > 0.0;
    let start_time = Date::now();

    loop {
        pivots += 1;

        // Determine which column to pivot
        let mut col_num = 0;
        for c in 1..matrix.cols {
            if matrix.tableau[c] < matrix.tableau[col_num] {
                col_num = c;
            }
        }

        if matrix.tableau[col_num] >= 0.0 {
            // No columns below zero, solution found
            break;
        }

        if !pivot_col(matrix, col_num) {
            // Failed to pivot column
            return (1, pivots, Date::now() - start_time);
        }

        if check {
            let time = Date::now() - start_time;
            if time >= timeout {
                return (2, pivots, time);
            }
        }
    }

    return (0, pivots, Date::now() - start_time);
}
