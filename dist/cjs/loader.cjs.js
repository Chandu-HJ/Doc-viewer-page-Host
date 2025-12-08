'use strict';

var index = require('./index-CwZRCTZi.js');
var appGlobals = require('./app-globals-V2Kpy_OQ.js');

const defineCustomElements = async (win, options) => {
  if (typeof window === 'undefined') return undefined;
  await appGlobals.globalScripts();
  return index.bootstrapLazy([["doc-page_3.cjs",[[768,"doc-workspace",{"scale":[2],"files":[32],"activeId":[32],"theme":[32]}],[768,"doc-viewer",{"src":[1],"scale":[2],"fileType":[1,"file-type"],"embedded":[1540],"theme":[1537],"mode":[1537],"numPages":[32],"activeTool":[32],"annotations":[32],"comments":[32],"sidebarOpen":[32],"sidebarPage":[32],"sidebarSelectedId":[32],"sidebarDraftText":[32],"sidebarDraftTag":[32],"visiblePages":[32]}],[768,"doc-page",{"src":[1],"page":[2],"scale":[2],"fileType":[1,"file-type"],"activeTool":[1,"active-tool"],"readOnly":[4,"read-only"],"visible":[4],"annotations":[16],"comments":[16]},null,{"visible":["visibleChanged"],"annotations":["annotationsChanged"],"comments":["commentsChanged"],"activeTool":["activeToolChanged"],"readOnly":["readOnlyChanged"]}]]]], options);
};

exports.setNonce = index.setNonce;
exports.defineCustomElements = defineCustomElements;
//# sourceMappingURL=loader.cjs.js.map
