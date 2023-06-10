import { NodeProperties } from './NodeProperties.js'

export class Node {
    tags: string[] = [];
    classNames: Set<string>[] = [];
    attributes: {[name: string]: string} = {};
    parent: Node | undefined = undefined;
    children: Node[] = [];
    lsibbling: Node | undefined = undefined;
    rsibbling: Node | undefined = undefined;
    text: string = "";
    properties: NodeProperties | null = null;
  
    public toString(): string {
      const tagStr = this.tags.join("/");
      const c = this.children.flatMap((c) => c.toString().split("\n").map((l) => "  " + l));
      return [tagStr, ...c].join("\n");
    }
  
    public static Leaf(z: Node): boolean {
      return z.children.length == 0;
    }
  
    public leaves(): Node[] {
      if (Node.Leaf(this)) {
        return [this];
      } else {
        return this.children.flatMap((child) => child.leaves());
      }
    }
  
    public treeHTML(): string {
      const main = `<a href='#'>${this.tags.filter((x) => x !== "#text").join(" / ")}<div class='features'>${this.properties?.toHTML}</div></a>`;
      const childStuff = this.children.length === 0 ? "" : `<ul>${this.children.map((c) => `<li>${c.treeHTML()}</li>`).join("\n")}</ul>`;
      return main + "\n" + childStuff;
    }
  
    public ancestors(): Node[] {
      if (!this.parent) {
        return [];
      } else {
        return [this.parent, ...this.parent.ancestors()];
      }
    }
  
    public tagPlusClass(): string {
      return this.tags
        .map((tag, index) => {
          const classString = Array.from(this.classNames[index]).map((c) => `.${c}`).join("");
          return tag + classString;
        })
        .join(",");
    }
  
    public classSelector(): string {
      const selectors = [this.tagPlusClass(), ...this.ancestors().map((a) => a.tagPlusClass())];
      return selectors.map((s) => `[${s}]`).join(" ");
    }
  }