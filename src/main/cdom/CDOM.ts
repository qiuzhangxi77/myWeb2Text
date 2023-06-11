import * as cheerio from 'cheerio';
import * as fs from 'fs';
import path from "path";
import { fileURLToPath } from 'url';

import { Node } from './Node.js'
import { NodeProperties } from './NodeProperties.js'
import { DOM } from './DOM.js'
import { isText, isTag } from 'domhandler'
import { FeatureExtractor } from '../features/FeatureExtractor.js';
import { BlockFeatureExtractor } from '../features/BlockFeatureExtractor.js';

import { NodeBlockExtractor } from '../features/extractor/NodeBlockExtractor.js';
import { DuplicateCountsExtractor } from '../features/extractor/DuplicateCountsExtractor.js';
import { LeafBlockExtractor } from '../features/extractor/LeafBlockExtractor.js';
import { AncestorExtractor } from '../features/extractor/AncestorExtractor.js';
import { RootExtractor } from '../features/extractor/RootExtractor.js';
import { TagExtractor } from '../features/extractor/TagExtractor.js';
import { CombinedBlockExtractorFactory } from '../features/extractor/CombinedBlockExtractor.js'
import { CombinedEdgeExtractorFactory } from '../features/extractor/CombinedEdgeExtractor.js';
import { TreeDistanceExtractor } from '../features/extractor/TreeDistanceExtractor.js';
import { BlockBreakExtractor } from '../features/extractor/BlockBreakExtractor.js';
import { CommonAncestorExtractor } from '../features/extractor/CommonAncestorExtractor.js';


export class CDOM {
  constructor(public root: Node, public leaves: Node[]) {}

  toString() {
    return this.root.toString();
  }

  public textCounts() {
    const map = new Map<string, number>();
    this.leaves.forEach(leaf => {
      const text = leaf.text;
      map.set(text, (map.get(text) || 0) + 1);
    });
    return map;
  }

  public classSelectorCounts() {
    const map = new Map<string, number>();
    this.leaves.forEach(leaf => {
      const classSelector = leaf.classSelector();
      map.set(classSelector, (map.get(classSelector) || 0) + 1);
    });
    return map;
  }
}


export class CDOMFactory {
  public html: string;
  public body: cheerio.Node;
  public root: Node | null;

  constructor(html: string) {
    this.html = html;
    this.init();
  }

  public init() {
    this.parseBody(this.html);
    this.fromBody(this.body);
  }

  
  public parseBody(html: string) {
    /** The start index of the node. Requires `withStartIndices` on the handler to be `true. */
    const $ = cheerio.load(html, { withStartIndices: true });
    $.parseHTML(html);
    const root = $.root();
    console.log("root: ", root.html())
    const body = $("body");
    console.log("body: ", body.html())
    this.body = body.get(0);
  };

  public fromBody(domnode: cheerio.Node) {
    this.root = CDOMFactory.createNodeWithChildrenAndFeatures(domnode); 
  }

  public get CDOM() {
    return new CDOM(this.root, this.root.leaves())
  }

  public static createNodeWithChildrenAndFeatures(domnode: cheerio.Node): Node | null {
      if (isTag(domnode) && DOM.isEmptyNode(domnode)) return null;
        if (isText(domnode) && DOM.isEmptyTextNode(domnode)) return null;
      if (DOM.isSkipNode(domnode)) return null;

      if (isText(domnode)) {
        const node = new Node();
        node.tags = ["#" + domnode.type],
        node.classNames = [new Set<string>()],
        node.attributes = {},
        node.children = [],
        node.text = domnode.data || '',
        node.properties = NodeProperties.fromNode(domnode, [])
        return node
      } 
      else if (isTag(domnode)) {
        const node = new Node();
        node.tags = [domnode.name];
        console.log("domnode.attribs: ", domnode.attribs);
        node.classNames = [new Set<string>(domnode.attribs?.class?.split(' '))];
        node.attributes = domnode.attribs;
        node.children = domnode.children
            .map(CDOMFactory.createNodeWithChildrenAndFeatures)
            .filter(child => child !== null) as Node[];
        if(!node.children.length) {
          return null;
        }
        else if (node.children.length === 1) {
          const child = node.children[0];
          node.children = child.children;
          node.tags = node.tags.concat(child.tags);
          node.classNames = node.classNames.concat(child.classNames);
          node.attributes = {...node.attributes, ...child.attributes}
          node.text = child.text;
          CDOMFactory.setPointers(node.children, node);
          node.properties = NodeProperties.fromNode(domnode, node.children);
          return node;
        }
        else {
          node.properties = NodeProperties.fromNode(domnode, node.children);
          CDOMFactory.setPointers(node.children, node);
          return node;
        }
      } else {
        return null;
      }
  }

  public static setPointers(childSequence: Node[], parent: Node | null) {
    let prev: Node | null = null;
    childSequence.forEach(child => {
      child.parent = parent;
      child.lsibbling = prev;
      if (prev !== null) {
        prev.rsibbling = child;
      }
      prev = child;
    });
  }

}







export default function parseHTML() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // 读取本地 HTML 文件
  const html = fs.readFileSync(path.join(__dirname, '/input.html'), 'utf8');

  // 使用 Cheerio 加载 HTML
  // const $ = cheerio.load(html);
  // const $ = cheerio.load('');
  // $.parseHTML(html);

  // // 移除空节点或只包含空白的节点
  // $('*:empty').remove();

  // // 移除没有任何内容的节点
  // $('br, checkbox, head, hr, iframe, img, input').remove();

  // // 合并单个子节点和它们的父节点
  // $('*:has(:only-child)').each(function () {
  //   const parent = $(this);
  //   const child = parent.children().first();
  //   parent.replaceWith(child);
  // });
  // console.log("dom: ",$.root().html());

  var domFactory = new CDOMFactory(html);
  var cdom = domFactory.CDOM;
  console.log("cdom: ", cdom);

  // features extractor

  const duplicateCountsExtractor = new DuplicateCountsExtractor();
  const leafBlockExtractor = new LeafBlockExtractor();
  const nodeBlockExtractorForBlock = new NodeBlockExtractor();
  const tagExtractor1 = new TagExtractor("node");
  const combinedNodeTag = CombinedBlockExtractorFactory.apply(nodeBlockExtractorForBlock, tagExtractor1);
  const ancestorExtractor1 = new AncestorExtractor(combinedNodeTag, 1);
  const ancestorExtractor2 = new AncestorExtractor(nodeBlockExtractorForBlock, 2);
  const rootExtractor = new RootExtractor(nodeBlockExtractorForBlock);
  const tagExtractor2 = new TagExtractor("leaf");
  
  const allBlockFeatureExtractor = CombinedBlockExtractorFactory.apply(
    duplicateCountsExtractor,
    leafBlockExtractor,
    ancestorExtractor1,
    ancestorExtractor2,
    rootExtractor,
    tagExtractor2
  );

  
  const treeDistanceExtractor = new TreeDistanceExtractor();
  const blockBreakExtractor = new BlockBreakExtractor();
  const nodeBlockExtractorForEdge = new NodeBlockExtractor();
  const commonAncestorExtractor = new CommonAncestorExtractor(nodeBlockExtractorForEdge);

  const allEdgeFeatureExtractor = CombinedEdgeExtractorFactory.apply(
    treeDistanceExtractor,
    blockBreakExtractor,
    commonAncestorExtractor
  );

  const featureExtractor = new FeatureExtractor(allBlockFeatureExtractor, allEdgeFeatureExtractor);
  const features = featureExtractor.apply(cdom);
  console.log("features: ", features);

}

parseHTML();

