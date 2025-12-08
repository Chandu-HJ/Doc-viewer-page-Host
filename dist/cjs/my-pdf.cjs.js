'use strict';

var index = require('./index-CwZRCTZi.js');
var appGlobals = require('./app-globals-V2Kpy_OQ.js');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
/*
 Stencil Client Patch Browser v4.38.3 | MIT Licensed | https://stenciljs.com
 */

var patchBrowser = () => {
  const importMeta = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('my-pdf.cjs.js', document.baseURI).href));
  const opts = {};
  if (importMeta !== "") {
    opts.resourcesUrl = new URL(".", importMeta).href;
  }
  return index.promiseResolve(opts);
};

patchBrowser().then(async (options) => {
  await appGlobals.globalScripts();
  return index.bootstrapLazy([["doc-page_3.cjs",[[768,"doc-workspace",{"scale":[2],"files":[32],"activeId":[32],"theme":[32]}],[768,"doc-viewer",{"src":[1],"scale":[2],"fileType":[1,"file-type"],"embedded":[1540],"theme":[1537],"mode":[1537],"numPages":[32],"activeTool":[32],"annotations":[32],"comments":[32],"sidebarOpen":[32],"sidebarPage":[32],"sidebarSelectedId":[32],"sidebarDraftText":[32],"sidebarDraftTag":[32],"visiblePages":[32]}],[768,"doc-page",{"src":[1],"page":[2],"scale":[2],"fileType":[1,"file-type"],"activeTool":[1,"active-tool"],"readOnly":[4,"read-only"],"visible":[4],"annotations":[16],"comments":[16]},null,{"visible":["visibleChanged"],"annotations":["annotationsChanged"],"comments":["commentsChanged"],"activeTool":["activeToolChanged"],"readOnly":["readOnlyChanged"]}]]]], options);
});

exports.setNonce = index.setNonce;
//# sourceMappingURL=my-pdf.cjs.js.map
