import { Rational } from '~/models';

export class SimplexUtility {
  static testPivot() {
    // const tableau = [
    //   [
    //     Rational.one,
    //     new Rational(BigInt(-3)),
    //     Rational.minusOne,
    //     Rational.zero,
    //     Rational.zero,
    //     Rational.zero,
    //   ],
    //   [
    //     Rational.zero,
    //     Rational.two,
    //     Rational.one,
    //     Rational.one,
    //     Rational.zero,
    //     new Rational(BigInt(8)),
    //   ],
    //   [
    //     Rational.zero,
    //     Rational.two,
    //     new Rational(BigInt(3)),
    //     Rational.zero,
    //     Rational.one,
    //     new Rational(BigInt(12)),
    //   ],
    // ];
    const tableau = [
      [
        Rational.one, // O
        Rational.zero, // Cr
        Rational.zero, // Wa
        Rational.from(-45), // Pe
        Rational.zero, // Li
        Rational.from(-10), // Hv
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero, // B
      ],
      [
        // hoc
        Rational.zero, // O
        Rational.zero, // Cr
        Rational.from(-30), // Wa
        Rational.zero, // Pe
        Rational.from(30), // Li
        Rational.from(-40), // Hv
        Rational.one,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.one, // B
      ],
      [
        // loc
        Rational.zero, // O
        Rational.zero, // Cr
        Rational.from(-30), // Wa
        Rational.from(20), // Pe
        Rational.from(-30), // Li
        Rational.zero, // Hv
        Rational.zero,
        Rational.one,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.one, // B
      ],
      [
        // basic
        Rational.zero, // O
        Rational.from(-100), // Cr
        Rational.zero, // Wa
        Rational.from(40), // Pe
        Rational.from(30), // Li
        Rational.from(30), // Hv
        Rational.zero,
        Rational.zero,
        Rational.one,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.one, // B
      ],
      [
        // adv
        Rational.zero, // O
        Rational.from(-100), // Cr
        Rational.from(-50), // Wa
        Rational.from(55), // Pe
        Rational.from(45), // Li
        Rational.from(10), // Hv
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.one,
        Rational.zero,
        Rational.zero,
        Rational.one, // B
      ],
      [
        // crude
        Rational.zero, // O
        Rational.one, // Cr
        Rational.zero, // Wa
        Rational.zero, // Pe
        Rational.zero, // Li
        Rational.zero, // Hv
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.one,
        Rational.zero,
        Rational.hundred, // B
      ],
      [
        // water
        Rational.zero, // O
        Rational.zero, // Cr
        Rational.one, // Wa
        Rational.zero, // Pe
        Rational.zero, // Li
        Rational.zero, // Hv
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.zero,
        Rational.one,
        Rational.from(10), // B
      ],
    ];

    let p = this.selectPivot(tableau);
    while (p != null) {
      this.pivot(p[0], p[1], tableau);
      p = this.selectPivot(tableau);
    }

    console.log('Found solution:');
    this.print(tableau);
  }

  static selectPivot(tableau: Rational[][]): [number, number] {
    // console.log('Selecting pivot column:');
    // this.print(tableau);
    let c: number = null;
    let r: number = null;
    for (let i = 0; i < tableau[0].length - 1; i++) {
      if (tableau[0][i].lt(Rational.zero)) {
        if (c == null || tableau[0][i].lt(tableau[0][c])) {
          // Found better pivot column, look for a valid pivot row
          const j = this.selectPivotRow(i, tableau);
          if (j != null) {
            c = i;
            r = j;
          }
        }
      }
    }
    if (c == null) {
      return null;
    }
    console.log(`Selected pivot [${c}, ${r}]`);
    return [c, r];
  }

  static selectPivotRow(c: number, tableau: Rational[][]) {
    // console.log(`Selecting pivot row from column ${c}:`);
    // this.print(tableau);
    let r: number = null;
    let v: Rational = null;
    for (let i = 1; i < tableau.length; i++) {
      if (tableau[i][c].gt(Rational.zero)) {
        const pivot = tableau[i][tableau[0].length - 1].div(tableau[i][c]);
        if (r == null || pivot.lt(v)) {
          // Found better pivot row
          r = i;
          v = pivot;
        }
      }
    }
    // console.log(`Selected pivot row ${r}`);
    return r;
  }

  /** Performs a simplex pivot operation */
  static pivot(c: number, r: number, tableau: Rational[][]) {
    console.log('Before pivot:');
    this.print(tableau);

    // Multiply pivot row by reciprocal of pivot element
    const reciprocal = tableau[r][c].reciprocal();
    for (let i = 0; i < tableau[r].length; i++) {
      tableau[r][i] = tableau[r][i].mul(reciprocal);
    }

    // console.log('After division:');
    // this.print(tableau);

    // Add multiples of pivot row to other rows to change pivot column to 0
    for (let i = 0; i < tableau.length; i++) {
      if (i !== r) {
        const factor = tableau[i][c].inverse();
        for (let j = 0; j < tableau[i].length; j++) {
          tableau[i][j] = tableau[i][j].add(tableau[r][j].mul(factor));
        }
      }
    }

    console.log('Pivot complete:');
    this.print(tableau);
  }

  static print(tableau: Rational[][]) {
    console.table(tableau.map((r) => r.map((c) => c.toFraction())));
  }
}
