
import { BlockFeatureExtractor } from "../BlockFeatureExtractor.js"
import { CDOM } from "../../cdom/CDOM.js"
import { Node } from "../../cdom/Node.js"

export class LeafBlockExtractor implements BlockFeatureExtractor {
  // b4 has word 1/0: there is at least one word in the text block
  // b5 log(n words) log(number of words) (clipped between 0 and 3.5)
  // b6 avg word length average word length (clipped between 3 and 15
  // b7 has stopword 1/0: block contains a stopword
  // b8 stopword ratio ratio of words the are in our stopword list
  // b9 log(n characters) log(number of characters) (clipped between 2.5 and 5.5)
  // b10 log(punctuation ratio) log(ratio of of characters 2 f; ; ?; ; ; :; !g to the total) (clipped between -4 and -2.5)
  // b11 has numeric 1/0: the node contains numeric characters
  // b12 numeric ratio ratio of numeric characters to the total character count
  // b13 log(avg sentence length) log(average sentence length) (clipped between 2 and 5)
  // b14 ends with punctuation 1/0: the node ends with a character 2 f; ; ?; ; ; :; !g
  // b15 ends with question mark 1/0: the node ends with a question mark
  // b16 contains copyright 1/0: the node contains a copyright symbol
  // b17 contains email 1/0: the node contains an email address
  // b18 contains url 1/0: the node contains a URL
  // b19 contains year 1/0: the node contains a word consisting of 4 digits
  // b20 ratio words with capital ratio of words starting with a capital letter
  // b21 ratio words with capital2 b25 squared
  // b22 ratio words with capital3 b25 to the power 3
  // b23 contains punctuation node contains a character 2 f; ; ?; ; ; :; !g
  // b24 n punctuation number of characters 2 f; ; ?; ; ; :; !g
  // b25 has multiple sentences 1/0: there are more than 1 sentences in the text
  // b26 relative position relative position of the start of this block in the source code
  // b27 relative position2 17 squared

  public labels: string[] = [
    "has_word",
    "log(n_words)",
    "avg_word_length [3,15]",
    "has_stopword",
    "stopword_ratio",
    "log(n_characters) [2.5,5.5]",
    "contains_punctuation",
    "n_punctuation [0,10]",
    "log(punctuation_ratio)",
    "has_numeric",
    "numeric_ratio",
    "log(avg_sentence_length) [2,5]",
    "has_multiple_sentences",
    "relative_position",
    "relative_position^2",
    "ends_with_punctuation",
    "ends_with_question_mark",
    "contains_copyright",
    "contains_email",
    "contains_url",
    "contains_year",
    "ratio_words_with_capital",
    "ratio_words_with_capital^2",
    "ratio_words_with_capital^3"
  ];

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
      const bodyEnd = cdom.leaves[cdom.leaves.length - 1]?.properties.endPosition ?? cdom.root.properties.endPosition;
      const bodyLength = bodyEnd - bodyStart;
      const blockPos = 0.5 * (p.endPosition + p.startPosition);
      const relPos = (blockPos - bodyStart) / bodyLength;
  
      const capRat = p.nWordsWithCapital / p.nWords;
  
      const v: number[] = [
        this.z(p.nWords > 0 ? 1 : 0, 0.8255, 0.5643817),
        p.nWords === 0 ? 0 : this.z(this.clip(Math.log(p.nWords), 0, 3.5), 1.5086, 1.205),
        p.nWords === 0 ? -1 : this.z(this.clip(p.totalWordLength / p.nWords, 3, 15), 4.910001, 1.905709),
        p.nStopwords > 0 ? 1 : 0,
        p.nWords === 0 ? 0 : this.z(p.nStopwords / p.nWords, 0.374, 0.1529),
        this.z(this.clip(Math.log(p.nCharacters), 2.5, 5.5), 3.392, 1.06445),
        p.nPunctuation > 0 ? 1 : 0,
        this.z(this.clip(p.nPunctuation, 0, 10), 0.06938, 0.4083676),
        p.nPunctuation === 0 ? 0 : this.z(this.clip(Math.log(p.nPunctuation / p.nCharacters), -4, -2.5), -3.338525, 0.6058926),
        this.z(p.nNumeric > 0 ? 1 : 0, -0.5900983, 0.8073342),
        this.z(p.nNumeric / p.nCharacters, 0.2655969, 0.3052819),
        this.z(this.clip(Math.log(p.nCharacters / p.nSentences), 2, 5), 3.109, 1.011),
        p.nSentences > 1 ? 1 : 0,
        this.z(relPos, 0.5198038, 0.2996195),
        this.z(relPos * relPos, 0.3599672, 0.3157282),
        p.endsWithPunctuation ? 1 : 0,
        p.endsWithQuestionMark ? 1 : 0,
        p.containsCopyright ? 1 : 0,
        p.containsEmail ? 1 : 0,
        p.containsUrl ? 1 : 0,
        p.containsYear ? 1 : 0,
        p.nWords > 0 ? this.z(capRat, 0.4475758, 0.4129316) : 0.0,
        p.nWords > 0 ? this.z(capRat * capRat, 0.3708354, 0.4334037) : 0.0,
        p.nWords > 0 ? this.z(capRat * capRat * capRat, 0.340843, 0.4404389) : 0.0,
      ]
      return v;
    }
  }


}
