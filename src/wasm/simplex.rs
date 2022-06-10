fn main() {
    println!("Rust says Hello to TutorialsPoint !!");

    const ROWS: usize = 6;
    const COLS: usize = 12;

    fn pivot_col(tableau: &mut [[f32; COLS]; ROWS], col_num: usize) -> bool {
        println!("pivot={}", col_num);
        tableau[0][0] = 6.0;
        return false;
    }

    fn pivot(tableau: &mut [[f32; COLS]; ROWS], col_num: usize, row_num: usize) -> bool {
        // Multiply pivot row by reciprocal of pivot element
        let row = &mut tableau[row_num];
        let val = row[col_num];
        let reciprocal = 1.0 / val;
        for i in 0..row.len() {
            row[i] = row[i] * reciprocal
        }
        return false;
    }

    let mut tableau: [[f32; COLS]; ROWS] = [
        [1.0, -1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        [
            0.0, 11.0, -10.0, -20.0, 9.0, 5.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
        ],
        [
            0.0, 10.0, -15.0, 0.0, -15.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0,
        ],
        [
            0.0, 0.0, 1200.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 120000.0,
        ],
        [
            0.0, 0.0, 0.0, 10.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 10000.0,
        ],
        [
            0.0, 0.0, -15.0, 0.0, 15.0, -20.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0,
        ],
    ];

    // let mut o = &mut tableau[0];
    // o[0] = 5.0;
    // println!("mut o = {}", o[0]);
    // println!("mut tableau = {}", tableau[0][0]);

    let mut pivots = 0;
    loop {
        pivots += 1;

        let mut col_num = 0;
        let objective = tableau[0];
        for i in 1..objective.len() {
            if objective[i] < objective[col_num] {
                col_num = i;
            }
        }

        if objective[col_num] >= 0.0 {
            println!("solved");
            break;
        }

        if !pivot_col(&mut tableau, col_num) {
            println!("failed");
            break;
        }

        println!("c={}", col_num);

        println!("x={}", pivots);
        if pivots == 15 {
            break;
        }
    }

    println!("final={}", tableau[0][0]);
    println!("done")
}
