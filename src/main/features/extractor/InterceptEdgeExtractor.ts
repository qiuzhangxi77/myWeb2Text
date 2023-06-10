import { CDOM } from '../../cdom/CDOM.js'
import { Node } from '../../cdom/Node.js'
import { EdgeFeatureExtractor } from '../EdgeFeatureExtractor.js'

export class InterceptEdgeExtractor implements EdgeFeatureExtractor {
  public labels: string[];

  constructor() {
    this.labels = ["intercept"];
  }

  public apply(cdom: CDOM): (nodeA: Node, nodeB: Node) => number[] {
    return (nodeA: Node, nodeB: Node) => [1];
  }
}
