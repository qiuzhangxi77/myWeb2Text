import { CDOM } from '../../cdom/CDOM.js'
import { Node } from '../../cdom/Node.js'
import { BlockFeatureExtractor } from '../BlockFeatureExtractor.js'


export class EmptyBlockExtractor implements BlockFeatureExtractor {
  public apply(cdom: CDOM): (node: Node) => number[] {
    return (node: Node) => [];
  }
  public labels: string[] = [];
}
