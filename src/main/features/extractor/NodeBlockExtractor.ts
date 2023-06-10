
import { BlockFeatureExtractor } from "../BlockFeatureExtractor.js"
import { CDOM } from "../../cdom/CDOM.js"
import { Node } from "../../cdom/Node.js"

export class NodeBlockExtractor implements BlockFeatureExtractor {
  public labels: string[] = ["body_percentage",
  "link_density",
  "avg_word_length [3,15]",
  "has_stopword",
  "stopword_ratio",
  "log(n_characters) [2.5,10]",
  "log(punctuation_ratio)",
  "has_numeric",
  "numeric_ratio",
  "log(avg_sentence_length) [2,5]",
  "ends_with_punctuation",
  "ends_with_question_mark",
  "contains_copyright",
  "contains_email",
  "contains_url",
  "contains_year",
  "ratio_words_with_capital",
  "ratio_words_with_capital^2",
  "ratio_words_with_capital^3",
  "contains_form_element"];

  constructor() { }

  public clip(v: number, min: number, max: number): number {
    return v > min ? (v < max ? v : max) : min;
  }
  
  public z(v: number, mean: number, sd: number): number {
    return (v - mean) / sd;
  }

  public apply(cdom: CDOM): (node: Node) => number[] {

    return (node: Node) => {
      const p = node.properties;
      const bodyStart = cdom.leaves[0]?.properties.startPosition ?? cdom.root.properties.startPosition;
      const bodyEnd = cdom.leaves.slice(-1)[0]?.properties.endPosition ?? cdom.root.properties.endPosition;
      const bodyLength = bodyEnd - bodyStart;
      const blockPos = 0.5 * (p.endPosition + p.startPosition);
      const relPos = (blockPos - bodyStart) / bodyLength;
    
      const capRat = p.nWordsWithCapital / p.nWords;
    
      const v: number[] = [
        (p.endPosition - p.startPosition) / bodyLength,
        this.z(p.nCharsInLink / p.nCharacters, 0.5, 0.5), // OK, guess
        p.nWords === 0 ? -1 : this.z(this.clip(p.totalWordLength / p.nWords, 3, 15), 4.910001, 1.905709), // OK
        p.nStopwords > 0 ? 1 : 0, // OK
        p.nWords === 0 ? 0 : this.z(p.nStopwords / p.nWords, 0.374, 0.1529), // OK
        this.z(this.clip(Math.log(p.nCharacters), 2.5, 10), 6, 2.14),
        p.nPunctuation === 0
          ? 0
          : this.z(this.clip(Math.log(p.nPunctuation / p.nCharacters), -4, -2.5), -3.338525, 0.6058926), // OK
          this.z(p.nNumeric > 0 ? 1 : 0, -0.5900983, 0.8073342), // OK
          this.z(p.nNumeric / p.nCharacters, 0.2655969, 0.3052819), // OK
          this.z(this.clip(Math.log(p.nCharacters / p.nSentences), 2, 5), 3.109, 1.011), // OK
        p.endsWithPunctuation ? 1 : 0, // OK, don't want to normalize
        p.endsWithQuestionMark ? 1 : 0, // OK, don't want to normalize
        p.containsCopyright ? 1 : 0, // OK, don't want to normalize
        p.containsEmail ? 1 : 0, // OK
        p.containsUrl ? 1 : 0, // OK
        p.containsYear ? 1 : 0, // OK
        p.nWords > 0 ? this.z(capRat, 0.4475758, 0.4129316) : 0.0, // OK
        p.nWords > 0 ? this.z(capRat * capRat, 0.3708354, 0.4334037) : 0.0, // OK
        p.nWords > 0 ? this.z(capRat * capRat * capRat, 0.340843, 0.4404389) : 0.0, // OK
        p.containsForm ? 1 : 0
      ];
      return v;
    };
  }


}

