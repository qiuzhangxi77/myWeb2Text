
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
      return [
        textCountMap.get(node.text) > 1 ? 1 : 0,
        textCountMap.get(node.text) > 10 ? 1 : 0,
        classCountMap.get(node.classSelector()) / cdom.leaves.length
      ];
    }
  }


}
