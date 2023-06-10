import { BlockFeatureExtractor } from "../BlockFeatureExtractor.js";
import { CDOM } from "../../cdom/CDOM.js";
import { Node } from "../../cdom/Node.js";

export class AncestorExtractor implements BlockFeatureExtractor {
  public labels: string[];

  constructor(public extractor: BlockFeatureExtractor, public level: number) {
    const prefix = this.prefix(this.level);
    const prefixedLabels = this.addPrefix(this.extractor.labels, prefix);
    this.labels = [this.fieldNameHas(this.level), ...prefixedLabels];
  }

  public apply(cdom: CDOM): (node: Node) => number[] {
    const loadedExtractor = this.extractor.apply(cdom);
    const zeroFeatures: number[] = this.extractor.labels.map(() => 0.0);

    return (node: Node) => {
      if (node.ancestors.length < this.level) {
        return [0.0, ...zeroFeatures];
      } else {
        const ancestorFeatures = loadedExtractor(node.ancestors[this.level - 1]);
        return [1.0, ...ancestorFeatures];
      }
    };
  }

  public prefix(level: number): string {
    if (level === 0) {
      return '';
    } else {
      return 'g'.repeat(level - 1) + 'p_';
    }
  }

  public addPrefix(labels: string[], prefix: string): string[] {
    return labels.map((label) => prefix + label);
  }

  private fieldNameHas(level: number): string {
    if (level === 0) {
      return '';
    } else {
      return 'has_' + 'g'.repeat(level - 1) + 'p';
    }
  }

}
