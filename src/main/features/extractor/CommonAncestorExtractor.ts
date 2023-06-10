import { EdgeFeatureExtractor } from "../EdgeFeatureExtractor.js";
import { BlockFeatureExtractor } from "../BlockFeatureExtractor.js"
import { CDOM } from "../../cdom/CDOM.js";
import { Node } from "../../cdom/Node.js";


export class CommonAncestorExtractor implements EdgeFeatureExtractor {
  public labels: string[];

  constructor(public ex: BlockFeatureExtractor) {
    this.labels = ex.labels.map(x => `common_ancestor_${x}`);
  }

  private firstCommonElement(a: Node[], b: Node[]): Node | undefined {
    if (a.length > b.length) {
      return b.find(x => a.includes(x));
    } else {
      return a.find(x => b.includes(x));
    }
  }

  private commonAncestor(nodeA: Node, nodeB: Node): Node {
    const ancestorsA = nodeA.ancestors();
    const ancestorsB = nodeB.ancestors();
    const commonElement = this.firstCommonElement(ancestorsA, ancestorsB);
    if (commonElement !== undefined) {
      return commonElement;
    } else {
      throw new Error("No common ancestor found");
    }
  }

  public apply(cdom: CDOM): (nodeA: Node, nodeB: Node) => number[] {
    const extractor = this.ex.apply(cdom);
    return (nodeA: Node, nodeB: Node) => {
      const ancestor = this.commonAncestor(nodeA, nodeB);
      return extractor(ancestor);
    };
  }
}
