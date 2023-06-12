
import { BlockFeatureExtractor } from "../BlockFeatureExtractor.js"
import { CDOM } from "../../cdom/CDOM.js"
import { Node } from "../../cdom/Node.js"

export class DuplicateCountsExtractor implements BlockFeatureExtractor  {
  public labels: string[] = ["has_duplicate", "has_10_duplicates","n_same_class_path"];

  constructor() {}

  public apply(cdom: CDOM): (node: Node) => number[] {

    return (node: Node) => {
      const textCountMap = cdom.textCounts();
      const classCountMap = cdom.classSelectorCounts();
      const textCount = textCountMap.get(node.text);
      const classCount = classCountMap.get(node.classSelector());
      // b1 has duplicate 1/0: is there another node with the same text
      // b2 has 10 duplicates 1/0: are there at least 10 other nodes with the same text?
      // b3 r same class path ratio of nodes on the page with the same class path (e.g. body>div>a.link>b)
      return [
        textCount > 1 ? 1.0 : 0,
        textCount > 10 ? 1.0 : 0,
        classCount / cdom.leaves.length
      ];
    }
  }


}
