import path from "path";
import { fileURLToPath } from "url";
import * as fs from 'fs';
import { CDOMFactory } from "./cdom/CDOM.js";
import { DuplicateCountsExtractor } from "./features/extractor/DuplicateCountsExtractor.js";
import { LeafBlockExtractor } from "./features/extractor/LeafBlockExtractor.js";
import { NodeBlockExtractor } from "./features/extractor/NodeBlockExtractor.js";
import { TagExtractor } from "./features/extractor/TagExtractor.js";
import { CombinedBlockExtractorFactory } from "./features/extractor/CombinedBlockExtractor.js";
import { AncestorExtractor } from "./features/extractor/AncestorExtractor.js";
import { RootExtractor } from "./features/extractor/RootExtractor.js";
import { TreeDistanceExtractor } from "./features/extractor/TreeDistanceExtractor.js";
import { BlockBreakExtractor } from "./features/extractor/BlockBreakExtractor.js";
import { CommonAncestorExtractor } from "./features/extractor/CommonAncestorExtractor.js";
import { CombinedEdgeExtractorFactory } from "./features/extractor/CombinedEdgeExtractor.js";
import { FeatureExtractor } from "./features/FeatureExtractor.js";
import * as Util from './utilities/Util.js'
import { error } from "console";

export function main_cdom(inputHtmlName: string) {
    /**************** step1: transform DOM to CDOM，and calculate the block and edge features  **************/
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
  
    // 读取本地 HTML 文件
    // const html = fs.readFileSync(path.join(__dirname, '/input.html'), 'utf8');
    const html = fs.readFileSync(path.join(__dirname, '/' + inputHtmlName), 'utf8');
  
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
  
    const domFactory = new CDOMFactory(html);
    const cdom = domFactory.CDOM;
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
  
    fs.writeFileSync("step_1_extracted_features_block_features.csv", features.blockFeatures.join('\n'));
    fs.writeFileSync("step_1_extracted_features_edge_features.csv", features.edgeFeatures.join('\n'));
    console.log("step_1_extracted_features_done");
  
    /********* step2: train the cnn network with the cleaneval dataset(python), and get classify labels  *******/
}

export function main_result(inputHtmlName:string, labelsFileName: string, outputTextName: string) {
    /*** step3: apply the classify labels to the html, and it should be displayed as text only include main content  ***/
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
  
    // 读取本地 HTML 文件
    // const html = fs.readFileSync(path.join(__dirname, '/input.html'), 'utf8');
    const html = fs.readFileSync(path.join(__dirname, '/' + inputHtmlName), 'utf8');
    const domFactory = new CDOMFactory(html);
    const cdom = domFactory.CDOM;

    // args[2] = fs.readFileSync(path.join(__dirname, '/input.html'), 'utf8');
    const labels = fs.readFileSync(path.join(__dirname, '/' + labelsFileName), 'utf-8').split(',').map(Number);
    fs.writeFileSync(path.join(__dirname, '/' + outputTextName), Util.cleanTextOutput(cdom, labels));
    console.log("done!")
}
  
// located on src\main folder
// put your input html filer here
// Command line argument: 
// step1: transform DOM to CDOM，and calculate the block and edge features
// type: cdomFeatures
    // parameters: "cdomFeatures input.html"
    // ts-node main.ts cdomFeatures input.html

// step2: train the cnn network with the cleaneval dataset(python), and get classify labels
//python python\main.py classify D:\MyGitHub\myWeb2Text\src\main\step_1_extracted_features D:\MyGitHub\myWeb2Text\src\main\classifyLabelsByPython

// step3: apply the classify labels to the html, and it should be displayed as text only include main content 
// type: result
    // parameters: "result input.html classifyLabelsByPython output.txt" 
    // // ts-node main.ts result input.html classifyLabelsByPython output.txt
const arg = process.argv.slice(2);
if (arg.length < 1) { throw error("Must input function type parameters") }
if (arg[0] === "cdomFeatures" && arg.length == 2) {
    main_cdom(arg[1]);
} else if (arg[0] === "result" && arg.length == 4) {
    main_result(arg[1],arg[2],arg[3]);
} else {
    throw error("wrong parameters")
}