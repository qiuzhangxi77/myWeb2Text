

import { BlockFeatureExtractor } from '../BlockFeatureExtractor.js'
import { CDOM } from '../../cdom/CDOM.js'
import { Node } from '../../cdom/Node.js'
import { EmptyBlockExtractor } from './EmptyBlockExtractor.js'

export class CombinedBlockExtractor implements BlockFeatureExtractor {
  public labels: string[];
  constructor(public exA: BlockFeatureExtractor, public exB: BlockFeatureExtractor) {
    this.labels = this.exA.labels.concat(this.exB.labels);
  }

  public apply(cdom: CDOM): (node: Node) => number[] {
    const initExA = this.exA.apply(cdom);
    const initExB = this.exB.apply(cdom);

    return (node: Node) => {
      const featuresA = initExA(node);
      const featuresB = initExB(node);
      return featuresA.concat(featuresB);
    };
  }

}

export class CombinedBlockExtractorFactory {
  public static apply(...exs: BlockFeatureExtractor[]): BlockFeatureExtractor {
    let zero: BlockFeatureExtractor =  new EmptyBlockExtractor();
    return exs.reduce((a, b) => new CombinedBlockExtractor(a, b), zero);
  }
}

