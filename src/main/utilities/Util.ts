import { CDOM } from "../cdom/CDOM.js";
import { Node } from "cheerio/lib/slim";

export function splitSentences(s: string): string[] {
    return s.split(/(?<=[.?!;])\s+(?=\p{Lu})/u);
}


export function cleanTextOutput(cdom: CDOM, labels: number[]): string {
    let outString = "";
    let breaked = true;
  
    cdom.leaves.forEach((leaf: Node, index: number) => {
      if (labels[index] === 1) {
        breaked = false;
        outString += leaf.text;
        if (leaf.properties.blockBreakAfter) {
            outString += "\n\n";
          breaked = true;
        }
      } else if (labels[index] === 0) {
        if (leaf.properties.blockBreakAfter && !breaked) {
            outString += "\n\n";
          breaked = true;
        }
      }
    });
  
    return outString;
  }