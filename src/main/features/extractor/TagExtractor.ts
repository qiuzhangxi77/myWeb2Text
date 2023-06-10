
import { BlockFeatureExtractor } from "../BlockFeatureExtractor.js"
import { CDOM } from "../../cdom/CDOM.js"
import { Node } from "../../cdom/Node.js"

export class TagExtractor implements BlockFeatureExtractor {
  private allTags: string[] ;
  private leafSelection: string[];
  private nodeSelection: string[];
  private selection: string[];
  public labels: string[];

  constructor(public mode: string = "leaf") {
    this.allTags = ["body","address","article","aside","blockquote","dd","div","dl","fieldset","figcaption","figure","figcaption","footer","form","h1","h2","h3","h4","h5","h6","header","hgroup","li","main","nav","noscript","ol","output","p","pre","section","table","tfoot","ul"].concat(
      ["b","big","i","small","tt","abbr","acronym","cite","code","dfn","em","kbd","strong","samp","time","var","a","bdo","q","span","sub","sup","label"]
    ).concat(
      ["td","tr","th","thead","tbody"]
    );
    this.leafSelection = ["a","p","td","b","li","span","i","tr","div","strong","em","h3","h2","table","h4","small","sup","h1","blockquote"];
    this.nodeSelection = ["td","div","p","tr","table","body","ul","span","li","blockquote","b","small","a","ol","ul","i","form","dl","strong","pre"];
    this.selection = (this.mode === "leaf") ? this.leafSelection : this.nodeSelection;
    this.labels = this.selection.map((tag) => `tag_${tag}`);
  }

  public apply(cdom: CDOM): (node: Node) => number[] {
    return (node: Node) => {
      return this.selection.map((tag) => node.tags.includes(tag) ? 1.0 : -1.0);
    };
  }
}
