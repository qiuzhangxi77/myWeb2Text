
  /** Collection of English stopwords */
export const stopwords = 
                    ["a","about","above","after","again","against","all","am","an","and","any","are","as","at","be","because","been","before","being",
                    "below","between","both","but","by","cannot","could","did","do","does","doing","down","during","each","few","for","from","further",
                    "had","has","have","having","he","her","here","hers","herself","him","himself","his","how","i","if","in","into","is","it","its",
                    "itself","me","more","most","my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours", 
                    "ourselves","out","over","own","same","she","should","so","some","such","than","that","the","their","theirs","them","themselves",
                    "then","there","these","they","this","those","through","to","too","under","until","up","very","was","we","were","what","when",
                    "where","which","while","who","whom","why","with","would","you","your","yours","yourself","yourselves"];

  /** List of characters that are considered punctuation */
  export const punctuation = ['.',',','?',';',':','!'];

  /** List of dashes */
  export const dashes = ['-','_','/','\\'];

  /** Tags not to be incorporated for the CDOM */
  export const skipTags = ["#doctype", "br", "checkbox", "head", "hr", "iframe", "img", "input", "meta", "noscript", "radio", "script", "select", "style",
                          "textarea", "title", "video"];

  /** Block level HTML elements */
  export const blockTags = ["address", "article", "aside", "blockquote", "body", "canvas",
                        "center", "checkbox", "dd", "div", "dl", "fieldset", "figcaption",
                        "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6",
                        "head", "header", "hgroup", "hr", "html", "iframe", "input", "li",
                        "main", "nav", "noscript", "ol", "ol", "output", "p", "pre", "radio",
                        "section", "select", "table", "tbody", "td", "textarea", "tfoot",
                        "thead", "tr", "ul", "video","br"]
