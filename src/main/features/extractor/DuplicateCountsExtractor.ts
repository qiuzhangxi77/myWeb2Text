
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
      return [
        textCount > 1 ? 1.0 : -1.0,
        textCount > 10 ? 1.0 : -1.0,
        Math.floor(classCount / cdom.leaves.length)
      ];
    }
  }


}
