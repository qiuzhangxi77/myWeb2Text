
import { EdgeFeatureExtractor } from '../EdgeFeatureExtractor.js'
import { CDOM } from '../../cdom/CDOM.js'
import { Node } from '../../cdom/Node.js'
import { EmptyEdgeExtractor } from './EmptyEdgeExtractor.js'

export class CombinedEdgeExtractor implements EdgeFeatureExtractor {
  public labels: string[];
  constructor(public exA: EdgeFeatureExtractor, public exB: EdgeFeatureExtractor) {
    this.labels = this.exA.labels.concat(this.exB.labels);
  }

  public apply(cdom: CDOM): (nodeA: Node, nodeB: Node) => number[] {
    const initExA = this.exA.apply(cdom);
    const initExB = this.exB.apply(cdom);
    return (nodeA: Node, nodeB: Node) => {
      return initExA(nodeA, nodeB).concat(initExB(nodeA, nodeB));
    };
  }

}

export class CombinedEdgeExtractorFactory {
  public static apply(...exs: EdgeFeatureExtractor[]): EdgeFeatureExtractor {
    let result: EdgeFeatureExtractor = new EmptyEdgeExtractor();
    exs.forEach((ex) => {
      result = new CombinedEdgeExtractor(result, ex);
    });
    return result;
  }
}
