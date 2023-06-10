import { BlockFeatureExtractor } from './BlockFeatureExtractor.js';
import { EdgeFeatureExtractor } from './EdgeFeatureExtractor.js';
import { PageFeatures } from './PageFeatures.js';
import { CDOM } from '../cdom/CDOM.js'
import { Node } from '../cdom/Node.js'


export class FeatureExtractor {
  public blockExtractor: BlockFeatureExtractor;
  public edgeExtractor: EdgeFeatureExtractor;

  constructor(blockExtractor: BlockFeatureExtractor, edgeExtractor: EdgeFeatureExtractor) {
    this.blockExtractor = blockExtractor;
    this.edgeExtractor = edgeExtractor;
  }

  public apply(cdom: CDOM): PageFeatures {
    const blockEx = this.blockExtractor.apply(cdom);
    const edgeEx = this.edgeExtractor.apply(cdom);

    const nBlocks = cdom.leaves.length;
    const edgeFeatureLength = this.edgeExtractor.labels.length;
    const blockFeatureLength = this.blockExtractor.labels.length;

    const blockFeatures = cdom.leaves.flatMap(blockEx);
    const pairs = cdom.leaves.slice(0, -1).map((a, i) => [a, cdom.leaves[i + 1]]);
    const edgeFeatures = pairs.flatMap(([a, b]) => edgeEx(a, b));

    return new PageFeatures(
      this.reshapeMatrix(blockFeatures, blockFeatureLength, nBlocks),
      this.blockExtractor.labels,
      this.reshapeMatrix(edgeFeatures, edgeFeatureLength, nBlocks - 1),
      this.edgeExtractor.labels)
  }

  public reshapeMatrix(vector: number[], numRows: number, numCols: number): number[][] {
    const matrix: number[][] = [];
    let rowIndex = 0;
    let colIndex = 0;

    for (const value of vector) {
      if (!matrix[rowIndex]) {
        matrix[rowIndex] = [];
      }

      matrix[rowIndex][colIndex] = value;

      colIndex++;
      if (colIndex === numCols) {
        rowIndex++;
        colIndex = 0;
      }
    }

    return matrix;
  }
}