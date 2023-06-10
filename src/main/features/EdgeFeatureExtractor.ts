// import { CombinedEdgeExtractor } from './extractor/CombinedEdgeExtractor.js'
import { CDOM } from '../cdom/CDOM.js'
import { Node } from '../cdom/Node.js'

export interface EdgeFeatureExtractor {
    apply(cdom: CDOM): (node1: Node, node2: Node) => number[];
    labels: string[];
    // plus(other: EdgeFeatureExtractor): CombinedEdgeExtractor;
}