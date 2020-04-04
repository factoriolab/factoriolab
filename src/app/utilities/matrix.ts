export class MatrixUtility {
  static rref(matrix: number[][]) {
    const rows = matrix.length;
    const columns = matrix[0].length;

    let lead = 0;
    for (let k = 0; k < rows; k++) {
      if (columns <= lead) {
        return;
      }

      let i = k;
      while (matrix[i][lead] === 0) {
        i++;
        if (rows === i) {
          i = k;
          lead++;
          if (columns === lead) {
            return;
          }
        }
      }
      const irow = matrix[i];
      const krow = matrix[k];
      (matrix[i] = krow), (matrix[k] = irow);

      let val = matrix[k][lead];
      for (let j = 0; j < columns; j++) {
        matrix[k][j] /= val;
      }

      for (let x = 0; x < rows; x++) {
        if (x === k) {
          continue;
        }
        val = matrix[x][lead];
        for (let y = 0; y < columns; y++) {
          matrix[x][y] -= val * matrix[k][y];
        }
      }
      lead++;
    }
    return matrix;
  }
}
