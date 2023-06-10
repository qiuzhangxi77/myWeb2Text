
import { CombinedBlockExtractor } from './extractor/CombinedBlockExtractor.js'
import { CDOM } from '../cdom/CDOM.js'
import { Node } from '../cdom/Node.js'

export interface BlockFeatureExtractor {
    apply(cdom: CDOM): (node: Node) => number[];
    labels: string[];
    // plus(other: BlockFeatureExtractor): CombinedBlockExtractor;
}