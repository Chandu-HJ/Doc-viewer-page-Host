import { h, } from "@stencil/core";
const pdfjsLib = window.pdfjsLib;
const pdfjsViewer = window.pdfjsViewer;
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.js';
export class DocPage {
    host;
    src;
    page;
    scale = 1.2;
    fileType = 'pdf';
    activeTool = 'select';
    // readOnly = true → no drawing/adding annotations
    readOnly = false;
    // virtual / lazy rendering flag
    visible = false;
    annotations = [];
    comments = [];
    annotationCreated;
    commentAddRequested;
    commentIconClicked;
    viewerContainer;
    annotationLayerEl = null;
    isDrawing = false;
    startX = 0;
    startY = 0;
    currentRectEl = null;
    hasRendered = false; // for lazy load
    async componentDidLoad() {
        await this.ensureRendered();
    }
    async visibleChanged() {
        await this.ensureRendered();
    }
    annotationsChanged() {
        this.redrawHighlightsFromProps();
    }
    commentsChanged() {
        this.redrawCommentsFromProps();
    }
    activeToolChanged() {
        this.updatePointerEvents();
    }
    readOnlyChanged() {
        this.updatePointerEvents();
    }
    // ========== LAZY RENDERING ==========
    async ensureRendered() {
        if (!this.visible)
            return; // not in viewport yet
        if (this.hasRendered)
            return; // already rendered once
        this.hasRendered = true;
        if (this.fileType === 'image') {
            await this.renderImagePage();
        }
        else if (this.fileType === 'text') {
            await this.renderTextPage();
        }
        else {
            await this.renderPdfPage();
        }
    }
    // ========== RENDER TYPES ==========
    async renderPdfPage() {
        const loadingTask = pdfjsLib.getDocument(this.src);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(this.page);
        const viewport = page.getViewport({ scale: this.scale });
        const eventBus = new pdfjsViewer.EventBus();
        const pageView = new pdfjsViewer.PDFPageView({
            container: this.viewerContainer,
            id: this.page,
            scale: this.scale,
            defaultViewport: viewport,
            eventBus,
            textLayerMode: 2,
        });
        pageView.setPdfPage(page);
        await pageView.draw();
        const pageDiv = pageView.div;
        // ✅ Make sure layout is fully done before creating annotation layer
        const setup = () => {
            this.setupAnnotationLayer(pageDiv);
            this.redrawHighlightsFromProps();
            this.redrawCommentsFromProps();
        };
        // double RAF → next layout + next paint
        requestAnimationFrame(() => {
            requestAnimationFrame(setup);
        });
    }
    async renderImagePage() {
        const pageDiv = document.createElement('div');
        pageDiv.classList.add('page');
        pageDiv.style.position = 'relative';
        this.viewerContainer.appendChild(pageDiv);
        const img = document.createElement('img');
        img.src = this.src;
        img.style.display = 'block';
        img.style.maxWidth = `${800 * this.scale}px`;
        pageDiv.appendChild(img);
        img.onload = () => {
            this.setupAnnotationLayer(pageDiv);
            this.redrawHighlightsFromProps();
            this.redrawCommentsFromProps();
        };
    }
    async renderTextPage() {
        const pageDiv = document.createElement('div');
        pageDiv.classList.add('page');
        pageDiv.style.position = 'relative';
        this.viewerContainer.appendChild(pageDiv);
        const textEl = document.createElement('pre');
        textEl.classList.add('text-content');
        textEl.style.fontSize = `${16 * this.scale}px`;
        textEl.style.whiteSpace = 'pre-wrap';
        const text = await fetch(this.src).then((r) => r.text());
        textEl.textContent = text;
        pageDiv.appendChild(textEl);
        this.setupAnnotationLayer(pageDiv);
        this.redrawHighlightsFromProps();
        this.redrawCommentsFromProps();
        // text highlight uses DOM selection
        textEl.addEventListener('mouseup', () => this.handleTextMouseUp());
    }
    // ========== ANNOTATION LAYER ==========
    setupAnnotationLayer(pageDiv) {
        const old = pageDiv.querySelector('.annotationLayer');
        if (old)
            old.remove();
        const layer = document.createElement('div');
        layer.classList.add('annotationLayer');
        Object.assign(layer.style, {
            position: 'absolute',
            inset: '0',
            zIndex: '999', // ensure it is on top of canvas/text
            pointerEvents: 'auto',
        });
        this.annotationLayerEl = layer;
        pageDiv.appendChild(layer);
        // Attach mouse handlers for all file types; logic inside onMouseDown handles special cases
        if (!this.readOnly) {
            layer.addEventListener('mousedown', (e) => this.onMouseDown(e));
            layer.addEventListener('mousemove', (e) => this.onMouseMove(e));
            layer.addEventListener('mouseup', () => this.onMouseUp());
        }
        this.updatePointerEvents();
    }
    // Centralized control for pointer-events depending on tool + file type
    updatePointerEvents() {
        if (!this.annotationLayerEl)
            return;
        const layer = this.annotationLayerEl;
        // READ ONLY → pass-through except icons
        if (this.readOnly) {
            layer.style.pointerEvents = 'none';
            layer
                .querySelectorAll('.comment-icon, .note-icon')
                .forEach((el) => (el.style.pointerEvents = 'auto'));
            return;
        }
        if (this.fileType === 'text') {
            // TEXT:
            // - highlight/select → let text receive events (selection)
            // - comment/note → layer must receive click for placement
            if (this.activeTool === 'highlight' || this.activeTool === 'select') {
                layer.style.pointerEvents = 'none';
            }
            else {
                // comment / note
                layer.style.pointerEvents = 'auto';
            }
        }
        else {
            // PDF / IMAGE:
            // - select → pass-through (no new drawings), icons clickable
            // - others → annotation layer active
            if (this.activeTool === 'select') {
                layer.style.pointerEvents = 'none';
            }
            else {
                layer.style.pointerEvents = 'auto';
            }
        }
        // Icons should always be clickable
        layer
            .querySelectorAll('.comment-icon, .note-icon')
            .forEach((el) => (el.style.pointerEvents = 'auto'));
    }
    // ========== MOUSE HANDLERS ==========
    onMouseDown(e) {
        if (!this.annotationLayerEl || this.readOnly)
            return;
        const rect = this.annotationLayerEl.getBoundingClientRect();
        if (!rect.width || !rect.height)
            return;
        // COMMENT / NOTE (all file types)
        if (this.activeTool === 'comment' || this.activeTool === 'note') {
            const xNorm = (e.clientX - rect.left) / rect.width;
            const yNorm = (e.clientY - rect.top) / rect.height;
            this.commentAddRequested.emit({
                page: this.page,
                x: xNorm,
                y: yNorm,
                kind: this.activeTool === 'comment' ? 'comment' : 'note',
            });
            return;
        }
        // HIGHLIGHT for pdf/image (rectangle drawing)
        if (this.activeTool !== 'highlight' || this.fileType === 'text')
            return;
        this.isDrawing = true;
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        this.currentRectEl = document.createElement('div');
        this.currentRectEl.className = 'annotationRect';
        this.currentRectEl.style.left = `${this.startX}px`;
        this.currentRectEl.style.top = `${this.startY}px`;
        this.annotationLayerEl.appendChild(this.currentRectEl);
    }
    onMouseMove(e) {
        if (this.readOnly)
            return;
        if (!this.isDrawing || !this.currentRectEl || !this.annotationLayerEl)
            return;
        const rect = this.annotationLayerEl.getBoundingClientRect();
        if (!rect.width || !rect.height)
            return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.currentRectEl.style.width = `${x - this.startX}px`;
        this.currentRectEl.style.height = `${y - this.startY}px`;
    }
    onMouseUp() {
        if (this.readOnly)
            return;
        if (!this.isDrawing || !this.annotationLayerEl || !this.currentRectEl)
            return;
        this.isDrawing = false;
        const layerRect = this.annotationLayerEl.getBoundingClientRect();
        const width = parseFloat(this.currentRectEl.style.width || '0');
        const height = parseFloat(this.currentRectEl.style.height || '0');
        if (width > 3 && height > 3 && layerRect.width && layerRect.height) {
            const normalized = {
                x: parseFloat(this.currentRectEl.style.left || '0') / layerRect.width,
                y: parseFloat(this.currentRectEl.style.top || '0') / layerRect.height,
                width: width / layerRect.width,
                height: height / layerRect.height,
            };
            this.annotationCreated.emit({ page: this.page, rect: normalized });
        }
        this.currentRectEl.remove();
        this.currentRectEl = null;
    }
    // ========== TEXT HIGHLIGHT ==========
    handleTextMouseUp() {
        if (this.readOnly)
            return;
        if (this.fileType !== 'text')
            return;
        if (this.activeTool !== 'highlight')
            return;
        if (!this.annotationLayerEl)
            return;
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed)
            return;
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        sel.removeAllRanges();
        const layerRect = this.annotationLayerEl.getBoundingClientRect();
        if (!layerRect.width || !layerRect.height || !rect.width || !rect.height)
            return;
        const x = rect.left - layerRect.left;
        const y = rect.top - layerRect.top;
        const normalized = {
            x: x / layerRect.width,
            y: y / layerRect.height,
            width: rect.width / layerRect.width,
            height: rect.height / layerRect.height,
        };
        const el = document.createElement('div');
        el.className = 'annotationRect';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.width = `${rect.width}px`;
        el.style.height = `${rect.height}px`;
        this.annotationLayerEl.appendChild(el);
        this.annotationCreated.emit({ page: this.page, rect: normalized });
    }
    // ========== REDRAW HIGHLIGHTS ==========
    redrawHighlightsFromProps() {
        if (!this.annotationLayerEl)
            return;
        this.annotationLayerEl.querySelectorAll('.annotationRect').forEach((el) => el.remove());
        const layerRect = this.annotationLayerEl.getBoundingClientRect();
        if (!layerRect.width || !layerRect.height)
            return;
        this.annotations.forEach((a) => {
            const el = document.createElement('div');
            el.className = 'annotationRect';
            el.style.left = `${a.x * layerRect.width}px`;
            el.style.top = `${a.y * layerRect.height}px`;
            el.style.width = `${a.width * layerRect.width}px`;
            el.style.height = `${a.height * layerRect.height}px`;
            this.annotationLayerEl.appendChild(el);
        });
        // Ensure icons remain clickable after redraw
        this.updatePointerEvents();
    }
    // ========== REDRAW COMMENTS + NOTES (WITH NOTE BUBBLE) ==========
    redrawCommentsFromProps() {
        if (!this.annotationLayerEl)
            return;
        // Remove old icons + bubbles
        this.annotationLayerEl
            .querySelectorAll('.comment-icon, .note-icon, .note-bubble')
            .forEach((el) => el.remove());
        const layerRect = this.annotationLayerEl.getBoundingClientRect();
        if (!layerRect.width || !layerRect.height)
            return;
        this.comments.forEach((c) => {
            const isNote = c.kind === 'note';
            const pxX = c.x * layerRect.width;
            const pxY = c.y * layerRect.height;
            // Create icon
            const icon = document.createElement('div');
            icon.className = isNote ? 'note-icon' : 'comment-icon';
            icon.textContent = isNote ? '📝' : '💬';
            icon.style.left = `${pxX}px`;
            icon.style.top = `${pxY}px`;
            // --- COMMENTS (💬) → icon only, click = open sidebar
            if (!isNote) {
                icon.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    this.commentIconClicked.emit({ page: this.page, commentId: c.id });
                });
                this.annotationLayerEl.appendChild(icon);
                return;
            }
            // --- NOTES (📝) → icon + popup text bubble
            const bubble = document.createElement('div');
            bubble.className = 'note-bubble';
            bubble.textContent = c.text && c.text.trim() !== '' ? c.text : '(empty note)';
            // Place near icon
            bubble.style.left = `${pxX}px`;
            bubble.style.top = `${pxY}px`;
            // Decide left/right based on available space
            const placeRight = pxX < layerRect.width * 0.6;
            bubble.classList.add(placeRight ? 'right' : 'left');
            // Hover → show
            icon.addEventListener('mouseenter', () => {
                bubble.classList.add('visible');
            });
            icon.addEventListener('mouseleave', () => {
                bubble.classList.remove('visible');
            });
            // Click → toggle + open sidebar
            icon.addEventListener('click', (ev) => {
                ev.stopPropagation();
                bubble.classList.toggle('visible');
                this.commentIconClicked.emit({ page: this.page, commentId: c.id });
            });
            this.annotationLayerEl.appendChild(bubble);
            this.annotationLayerEl.appendChild(icon);
        });
        // Make sure icons stay clickable
        this.updatePointerEvents();
    }
    render() {
        return (h("div", { key: 'c66d3053eb9f0aee149287d428fb7bfd0f6579c2', class: "page-wrapper" }, h("div", { key: 'bbe543561da64798a590abfcb7aaad5dfa4bfe45', class: "pdfViewerPage", ref: (el) => (this.viewerContainer = el) })));
    }
    static get is() { return "doc-page"; }
    static get originalStyleUrls() {
        return {
            "$": ["doc-page.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["doc-page.css"]
        };
    }
    static get properties() {
        return {
            "src": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "src"
            },
            "page": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "page"
            },
            "scale": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "scale",
                "defaultValue": "1.2"
            },
            "fileType": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "'pdf' | 'image' | 'text'",
                    "resolved": "\"image\" | \"pdf\" | \"text\"",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "file-type",
                "defaultValue": "'pdf'"
            },
            "activeTool": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "'select' | 'highlight' | 'comment' | 'note'",
                    "resolved": "\"comment\" | \"highlight\" | \"note\" | \"select\"",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "active-tool",
                "defaultValue": "'select'"
            },
            "readOnly": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "read-only",
                "defaultValue": "false"
            },
            "visible": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "visible",
                "defaultValue": "false"
            },
            "annotations": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "NormalizedRect[]",
                    "resolved": "NormalizedRect[]",
                    "references": {
                        "NormalizedRect": {
                            "location": "import",
                            "path": "../../types/annotations",
                            "id": "src/types/annotations.ts::NormalizedRect"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
            },
            "comments": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "PageComment[]",
                    "resolved": "PageComment[]",
                    "references": {
                        "PageComment": {
                            "location": "import",
                            "path": "../../types/comments",
                            "id": "src/types/comments.ts::PageComment"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
            }
        };
    }
    static get events() {
        return [{
                "method": "annotationCreated",
                "name": "annotationCreated",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "{ page: number; rect: NormalizedRect }",
                    "resolved": "{ page: number; rect: NormalizedRect; }",
                    "references": {
                        "NormalizedRect": {
                            "location": "import",
                            "path": "../../types/annotations",
                            "id": "src/types/annotations.ts::NormalizedRect"
                        }
                    }
                }
            }, {
                "method": "commentAddRequested",
                "name": "commentAddRequested",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "{\r\n    page: number;\r\n    x: number;\r\n    y: number;\r\n    kind: AnnotationKind;\r\n  }",
                    "resolved": "{ page: number; x: number; y: number; kind: AnnotationKind; }",
                    "references": {
                        "AnnotationKind": {
                            "location": "import",
                            "path": "../../types/comments",
                            "id": "src/types/comments.ts::AnnotationKind"
                        }
                    }
                }
            }, {
                "method": "commentIconClicked",
                "name": "commentIconClicked",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "{ page: number; commentId: string }",
                    "resolved": "{ page: number; commentId: string; }",
                    "references": {}
                }
            }];
    }
    static get elementRef() { return "host"; }
    static get watchers() {
        return [{
                "propName": "visible",
                "methodName": "visibleChanged"
            }, {
                "propName": "annotations",
                "methodName": "annotationsChanged"
            }, {
                "propName": "comments",
                "methodName": "commentsChanged"
            }, {
                "propName": "activeTool",
                "methodName": "activeToolChanged"
            }, {
                "propName": "readOnly",
                "methodName": "readOnlyChanged"
            }];
    }
}
//# sourceMappingURL=doc-page.js.map
