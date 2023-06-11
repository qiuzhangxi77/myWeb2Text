import * as cheerio from 'cheerio';
import { DOM } from './DOM.js'
import { Element } from "domhandler";
import { Node } from './Node.js'
import * as Util from '../utilities/Util.js';
import * as Settings from '../utilities/Setting.js';
import { getElementsByTagName } from 'domutils'
import { isText, isTag } from 'domhandler'

/** Node properties */
export class NodeProperties {

  constructor(
    public nCharacters: number,
    public nWords: number,
    public nSentences: number,
    public nPunctuation: number,
    public nNumeric: number,
    public nDashes: number,
    public nStopwords: number,
    public nWordsWithCapital: number,
    public nCharsInLink: number,
    public totalWordLength: number,
    public endsWithPunctuation: boolean,
    public endsWithQuestionMark: boolean,
    public startPosition: number,
    public endPosition: number,
    public nChildrenDeep: number,
    public containsCopyright: boolean,
    public containsEmail: boolean,
    public containsUrl: boolean,
    public containsYear: boolean,
    public blockBreakBefore: boolean,
    public blockBreakAfter: boolean,
    public brBefore: boolean,
    public brAfter: boolean,
    public containsForm: boolean
  ) {
    this.nCharacters = nCharacters;
    this.nWords = nWords;
    this.nSentences = nSentences;
    this.nPunctuation = nPunctuation;
    this.nNumeric = nNumeric;
    this.nDashes = nDashes;
    this.nStopwords = nStopwords;
    this.nWordsWithCapital = nWordsWithCapital;
    this.nCharsInLink = nCharsInLink;
    this.totalWordLength = totalWordLength;
    this.endsWithPunctuation = endsWithPunctuation;
    this.endsWithQuestionMark = endsWithQuestionMark;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.nChildrenDeep = nChildrenDeep;
    this.containsCopyright = containsCopyright;
    this.containsEmail = containsEmail;
    this.containsUrl = containsUrl;
    this.containsYear = containsYear;
    this.blockBreakBefore = blockBreakBefore;
    this.blockBreakAfter = blockBreakAfter;
    this.brBefore = brBefore;
    this.brAfter = brAfter;
    this.containsForm = containsForm;
  }
  
  
  public toHTML(): string {
    return `
      <dl>
        <dt>nCharacters</dt><dd>${this.nCharacters}</dd>
        <dt>nWords</dt><dd>${this.nWords}</dd>
        <dt>nSentences</dt><dd>${this.nSentences}</dd>
        <dt>nPunctuation</dt><dd>${this.nPunctuation}</dd>
        <dt>nNumeric</dt><dd>${this.nNumeric}</dd>
        <dt>nDashes</dt><dd>${this.nDashes}</dd>
        <dt>nStopwords</dt><dd>${this.nStopwords}</dd>
        <dt>nWordsWithCapital</dt><dd>${this.nWordsWithCapital}</dd>
        <dt>nCharsInLink</dt><dd>${this.nCharsInLink}</dd>
        <dt>containsCopyright</dt><dd>${this.containsCopyright}</dd>
        <dt>totalWordLength</dt><dd>${this.totalWordLength}</dd>
        <dt>endsWithPunctuation</dt><dd>${this.endsWithPunctuation}</dd>
        <dt>endsWithQuestionMark</dt><dd>${this.endsWithQuestionMark}</dd>
        <dt>startPosition</dt><dd>${this.startPosition}</dd>
        <dt>endPosition</dt><dd>${this.endPosition}</dd>
        <dt>nChildrenDeep</dt><dd>${this.nChildrenDeep}</dd>
        <dt>blockBreakBefore</dt><dd>${this.blockBreakBefore}</dd>
        <dt>blockBreakAfter</dt><dd>${this.blockBreakAfter}</dd>
        <dt>brBefore</dt><dd>${this.brBefore}</dd>
        <dt>brAfter</dt><dd>${this.brAfter}</dd>
        <dt>containsForm</dt><dd>${this.containsForm}</dd>
      </dl>`;
  }

  public static fromNode(domnode: cheerio.Node, children: Node[]): NodeProperties {
    switch (children.length) {
        // If there are no children, this is a leaf
        case 0: {
            const text = DOM.text(domnode).trim();
            const words = text.split(/\W+/).filter(x => x.length > 0);
            const sentences = Util.splitSentences(text);
    
            const regexEmail = new RegExp("\\b(?=[^\\s]+)(?=(\\w+)@([\\w\\.]+))\\b");
            const regexUrl = new RegExp("\\b(https?|ftp)://[^\\s/$.?#].[^\\s]*\\b");
            const regexYear = new RegExp("\\b\\d{4}\\b");

            const nCharacters = Math.max(text.length, 1);
            const nWords = words.length;
            const nSentences = sentences.length;
            const nPunctuation = text.split("").filter(x => Settings.punctuation.includes(x)).length;
            const nNumeric = text.split("").filter(x => x.charCodeAt(0) >= 48 && x.charCodeAt(0) <= 57).length;
            const nDashes = text.split("").filter(x => Settings.dashes.includes(x)).length;
            const nStopwords = words.filter(x => Settings.stopwords.includes(x)).length;
            const nWordsWithCapital = words.filter(x => x.charCodeAt(0) >= 65 && x.charCodeAt(0) <= 90).length;
            const nCharsInLink = isTag(domnode) && domnode.tagName === "a" ? text.length : 0;
            const totalWordLength = words.map(w => w.length).reduce((a, b) => a + b, 0);
            const endsWithPunctuation = text.length > 0 ? Settings.punctuation.includes(text[text.length - 1]) : false;
            const endsWithQuestionMark = text.length > 0 ? text[text.length - 1] === "?" : false;
            const startPosition = domnode.startIndex;
            const endPosition = domnode.endIndex;
            const nChildrenDeep = 0;
            const containsCopyright = text.includes("©");
            const containsEmail = regexEmail.test(text);
            const containsUrl = regexUrl.test(text);
            const containsYear = regexYear.test(text);
            const blockBreakBefore = domnode.previousSibling !== null && isTag(domnode.previousSibling) && Settings.blockTags.includes(domnode.previousSibling.tagName);
            const blockBreakAfter = domnode.nextSibling !== null && isTag(domnode.nextSibling) && Settings.blockTags.includes(domnode.nextSibling.tagName);
            const brBefore = domnode.previousSibling !== null && isTag(domnode.previousSibling)&& domnode.previousSibling.tagName === "br";
            const brAfter = domnode.nextSibling !== null && isTag(domnode.nextSibling) && domnode.nextSibling.tagName === "br";
            const containsForm = domnode instanceof Element &&  !!getElementsByTagName("input", domnode, true).length;
            
            const features = new NodeProperties(
              nCharacters,
              nWords,
              nSentences,
              nPunctuation,
              nNumeric,
              nDashes,
              nStopwords,
              nWordsWithCapital,
              nCharsInLink,
              totalWordLength,
              endsWithPunctuation,
              endsWithQuestionMark,
              startPosition,
              endPosition,
              nChildrenDeep,
              containsCopyright,
              containsEmail,
              containsUrl,
              containsYear,
              blockBreakBefore,
              blockBreakAfter,
              brBefore,
              brAfter,
              containsForm
          );
          return features;
        }

      case 1: {
            const cfeat = children[0].properties;
            // const tag = domnode.nodeName;
            // const prevtag = domnode.previousSibling?.nodeName || "[none]";
            // const nexttag = domnode.nextSibling?.nodeName || "[none]";
            const tag = isTag(domnode) ? domnode.tagName : "[none]";
            let prevtag = "[none]";
            let nexttag = "[none]";
            if (!domnode.previousSibling) prevtag = "[none]";
            else if (isTag(domnode.previousSibling)) {
              prevtag = domnode.previousSibling.tagName;
            } else if(isText(domnode.previousSibling)) {
              prevtag = "#" + domnode.previousSibling.type;
            } else {
              prevtag = domnode.previousSibling.type;
            }

            if (!domnode.nextSibling) nexttag = "[none]";
            else if (isTag(domnode.nextSibling)) {
              nexttag = domnode.nextSibling.tagName;
            } else if(isText(domnode.nextSibling)) {
              nexttag = "#" + domnode.nextSibling.type;
            } else {
              nexttag = domnode.nextSibling.type;
            }
          
            if (!cfeat) {
              throw new Error(
                "We cannot initialize features from a child, if the child doesn't have them"
              );
            }
          
            const blockBreakBefore =
              Settings.blockTags.includes(tag) || Settings.blockTags.includes(prevtag);
            const blockBreakAfter =
              Settings.blockTags.includes(tag) || Settings.blockTags.includes(nexttag);
          
            if (blockBreakBefore) {
              NodeProperties.propagateDownBlockTagLeft(children);
            }
            if (blockBreakAfter) {
              NodeProperties.propagateDownBlockTagRight(children);
            }
          
            const nCharacters = cfeat.nCharacters;
            const nWords = cfeat.nWords;
            const nSentences = cfeat.nSentences;
            const nPunctuation = cfeat.nPunctuation;
            const nNumeric = cfeat.nNumeric;
            const nDashes = cfeat.nDashes;
            const nStopwords = cfeat.nStopwords;
            const nWordsWithCapital = cfeat.nWordsWithCapital;
            const nCharsInLink = isTag(domnode) && domnode.tagName === "a" ? cfeat.nCharacters : cfeat.nCharsInLink;
            const totalWordLength = cfeat.totalWordLength;
            const endsWithPunctuation = cfeat.endsWithPunctuation;
            const endsWithQuestionMark = cfeat.endsWithQuestionMark;
            const startPosition = cfeat.startPosition > -1 ? cfeat.startPosition : domnode.startIndex;
            const endPosition = cfeat.endPosition > -1 ? cfeat.endPosition : domnode.endIndex;
            const nChildrenDeep = cfeat.nChildrenDeep;
            const containsCopyright = cfeat.containsCopyright;
            const containsEmail = cfeat.containsEmail;
            const containsUrl = cfeat.containsUrl;
            const containsYear = cfeat.containsYear;
            // blockBreakBefore;
            // blockBreakAfter;
            const brBefore = cfeat.brBefore || (domnode.previousSibling !== null &&  isTag(domnode) && domnode.tagName === "br");
            const brAfter = cfeat.brAfter || (domnode.nextSibling !== null &&  isTag(domnode) && domnode.tagName === "br");
            const containsForm = cfeat.containsForm;

            const features = new NodeProperties(
              nCharacters,
              nWords,
              nSentences,
              nPunctuation,
              nNumeric,
              nDashes,
              nStopwords,
              nWordsWithCapital,
              nCharsInLink,
              totalWordLength,
              endsWithPunctuation,
              endsWithQuestionMark,
              startPosition,
              endPosition,
              nChildrenDeep,
              containsCopyright,
              containsEmail,
              containsUrl,
              containsYear,
              blockBreakBefore,
              blockBreakAfter,
              brBefore,
              brAfter,
              containsForm
            );
            return features;
        }

        default: {
            const cfeat = children.map((child) => child.properties);
            // const tag = domnode.nodeName;
            // const prevtag = domnode.previousSibling?.nodeName || "[none]";
            // const nexttag = domnode.nextSibling?.nodeName || "[none]";
            const tag = isTag(domnode) ? domnode.tagName : "[none]";
            let prevtag = "[none]";
            let nexttag = "[none]";
            if (!domnode.previousSibling) prevtag = "[none]";
            else if (isTag(domnode.previousSibling)) {
              prevtag = domnode.previousSibling.tagName;
            } else if(isText(domnode.previousSibling)) {
              prevtag = "#" + domnode.previousSibling.type;
            } else {
              prevtag = domnode.previousSibling.type;
            }

            if (!domnode.nextSibling) nexttag = "[none]";
            else if (isTag(domnode.nextSibling)) {
              nexttag = domnode.nextSibling.tagName;
            } else if(isText(domnode.nextSibling)) {
              nexttag = "#" + domnode.nextSibling.type;
            } else {
              nexttag = domnode.nextSibling.type;
            }
            
          
            const blockBreakBefore =
              Settings.blockTags.includes(tag) || Settings.blockTags.includes(prevtag);
            const blockBreakAfter =
              Settings.blockTags.includes(tag) || Settings.blockTags.includes(nexttag);
          
            if (blockBreakBefore) {
              NodeProperties.propagateDownBlockTagLeft(children);
            }
            if (blockBreakAfter) {
              NodeProperties.propagateDownBlockTagRight(children);
            }
            
            const nCharacters = 0;
            const nWords = 0;
            const nSentences = 0;
            const nPunctuation = 0;
            const nNumeric = 0;
            const nDashes = 0;
            const nStopwords = 0;
            const nWordsWithCapital = 0;
            const nCharsInLink = 0;
            const totalWordLength = 0;
            const endsWithPunctuation = cfeat[cfeat.length - 1].endsWithPunctuation;
            const endsWithQuestionMark = cfeat[cfeat.length - 1].endsWithQuestionMark;
            const startPosition = cfeat[0].startPosition;
            const endPosition = cfeat[cfeat.length - 1].endPosition;
            const nChildrenDeep = cfeat.length;
            const containsCopyright = false;
            const containsEmail = false;
            const containsUrl = false;
            const containsYear = false;
            // blockBreakBefore;
            // blockBreakAfter;
            const brBefore = prevtag === "br";
            const brAfter = nexttag === "br";
            const containsForm = domnode instanceof Element &&  !!getElementsByTagName("input", domnode, true).length;

            const features = new NodeProperties(
              nCharacters,
              nWords,
              nSentences,
              nPunctuation,
              nNumeric,
              nDashes,
              nStopwords,
              nWordsWithCapital,
              nCharsInLink,
              totalWordLength,
              endsWithPunctuation,
              endsWithQuestionMark,
              startPosition,
              endPosition,
              nChildrenDeep,
              containsCopyright,
              containsEmail,
              containsUrl,
              containsYear,
              blockBreakBefore,
              blockBreakAfter,
              brBefore,
              brAfter,
              containsForm
            );
          
            cfeat.forEach((x) => {
              features.nCharacters += x.nCharacters;
              features.nWords += x.nWords;
              features.nSentences += x.nSentences;
              features.nPunctuation += x.nPunctuation;
              features.nNumeric += x.nNumeric;
              features.nDashes += x.nDashes;
              features.nStopwords += x.nStopwords;
              features.nWordsWithCapital += x.nWordsWithCapital;
              features.totalWordLength += x.totalWordLength;
              features.nChildrenDeep += x.nChildrenDeep;
              features.nCharsInLink +=
                tag === "a" ? x.nCharacters : x.nCharsInLink;
              features.containsCopyright =
                x.containsCopyright || features.containsCopyright;
              features.containsEmail = x.containsEmail || features.containsEmail;
              features.containsUrl = x.containsUrl || features.containsUrl;
              features.containsYear = x.containsYear || features.containsYear;
            });
          
            return features;
          }
    }
  }

  public static propagateDownBlockTagLeft(children: Node[]): void {
    let childs = children;
  
    while (childs.length > 0) {
      const left = childs[0];
  
      if (left.properties.blockBreakBefore === true) return;
  
      left.properties.blockBreakBefore = true;
      childs = left.children;
    }
  }

  public static propagateDownBlockTagRight(children: Node[]): void {
    let childs = children;
  
    while (childs.length > 0) {
      const right = childs[childs.length - 1];
  
      if (right.properties.blockBreakAfter === true) return;
  
      right.properties.blockBreakAfter = true;
      childs = right.children;
    }
  }

}
