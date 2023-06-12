
import { CDOM } from '../../cdom/CDOM.js'
import { Node } from '../../cdom/Node.js'
import { EdgeFeatureExtractor } from '../EdgeFeatureExtractor.js'


export class TreeDistanceExtractor implements EdgeFeatureExtractor {
  public labels: string[];

  // e1 tree_distance_2
  // e2 tree_distance_3
  // e3 tree_distance_4
  // e4 tree_distance_more
  // 对应树距离为2、3、4和大于4
  
  constructor() {
    this.labels = [
      "tree_distance_2",
      "tree_distance_3",
      "tree_distance_4",
      "tree_distance_more"
    ];
  }

  private firstCommonElement(a: Node[], b: Node[]): Node | undefined {
    if (a.length > b.length) {
      return b.find(x => a.includes(x));
    } else {
      return a.find(x => b.includes(x));
    }
  }

  public apply(cdom: CDOM): (nodeA: Node, nodeB: Node) => number[] {
    return (nodeA: Node, nodeB: Node) => {
      const aAncestors = nodeA.ancestors();
      const bAncestors = nodeB.ancestors();
      const ancestor = this.firstCommonElement(aAncestors, bAncestors);
      const depth = aAncestors.indexOf(ancestor) + bAncestors.indexOf(ancestor) + 2;

      const result: number[] = [];
      result.push(depth === 2 ? 1 : -1);
      result.push(depth === 3 ? 1 : -1);
      result.push(depth === 4 ? 1 : -1);
      result.push(depth > 4 ? 1 : -1);

      return result;
    };
  }
}
