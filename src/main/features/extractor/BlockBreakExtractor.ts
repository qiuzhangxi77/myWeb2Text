
import { EdgeFeatureExtractor } from "../EdgeFeatureExtractor.js";
import { CDOM } from "../../cdom/CDOM.js";
import { Node } from "../../cdom/Node.js";

export class BlockBreakExtractor implements EdgeFeatureExtractor {
  public labels: string[];

  constructor() {
    // // e5 Another feature signifies if there is a line break between the nodes in an unstyled HTML page
    this.labels = ["block_break"];
  }

  public apply(cdom: CDOM): (nodeA: Node, nodeB: Node) => number[] {
    return (nodeA: Node, nodeB: Node) => {
      return [nodeA.properties.blockBreakAfter || nodeB.properties.blockBreakBefore ? 1.0 : 0.0];
    };
  }
}