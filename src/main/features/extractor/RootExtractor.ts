
import { BlockFeatureExtractor } from "../BlockFeatureExtractor.js"
import { CDOM } from "../../cdom/CDOM.js"
import { Node } from "../../cdom/Node.js"

export class RootExtractor implements BlockFeatureExtractor {
  public prefix: string = "root_";
  public labels: string[];

  constructor(public extractor: BlockFeatureExtractor) {
    this.extractor = extractor;
    this.labels = this.addPrefix(extractor.labels, this.prefix);
  }

  private addPrefix(labels: string[], prefix: string): string[] {
    return labels.map((label) => prefix + label);
  }

  public apply(cdom: CDOM): (node: Node) => number[] {
    const rootFeatures = this.extractor.apply(cdom)(cdom.root);
    return (node: Node) => rootFeatures;
  }
}
