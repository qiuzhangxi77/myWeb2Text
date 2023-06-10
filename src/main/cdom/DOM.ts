import * as cheerio from 'cheerio';
import { isText, isTag } from 'domhandler'
import { getText } from 'domutils'
import * as Settings from '../utilities/Setting.js';


/** Collection of miscellaneous tools related to the Cheerio DOM */
export class DOM {

  /** Pattern matching class for empty nodes */
  public static isEmptyNode(domnode: cheerio.Element): boolean {
    return getText(domnode).trim().match(/^[\p{Z}\s]*$/) !== null;
  }

  /** Pattern matching class for empty text nodes */
  public static isEmptyTextNode(domnode: cheerio.AnyNode): boolean {
    // return getText(domnode).trim().match(/^[\p{Z}\s]*$/) !== null;
    return getText(domnode).trim().match(/^[\p{Z}\s\n]*$/) !== null;
  }

  /** Pattern matching class for nodes that are not to be incorporated in the CDOM */
  public static isSkipNode(domnode: cheerio.Node): boolean {
    return isTag(domnode) && Settings.skipTags.includes(domnode.tagName);
  }

  /** Extract the text from a node, and return "" if not supported */
  public static text(domnode: cheerio.Node): string {
    if (isText(domnode)) {
      return domnode.data;
    } else if (isTag(domnode)) {
      return getText(domnode);
    } else {
      return '';
    }
  }
}