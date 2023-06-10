
import { BlockFeatureExtractor } from "../BlockFeatureExtractor.js"
import { CDOM } from "../../cdom/CDOM.js"
import { Node } from "../../cdom/Node.js"

export class InterceptBlockExtractor implements BlockFeatureExtractor {
  public labels: string[];

  constructor() {
    this.labels = ["intercept"];
  }

  public apply(cdom: CDOM): (node: Node) => number[] {
    return (node: Node) => [1];
  };


}
