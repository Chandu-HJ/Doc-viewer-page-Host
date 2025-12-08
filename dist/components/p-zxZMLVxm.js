import { p as proxyCustomElement, H, c as createEvent, h } from './p-BoFG1DUe.js';

const docPageCss = ".page-wrapper{margin:24px auto;position:relative;width:fit-content;max-width:100%}.pdfViewerPage .page{position:relative;border-radius:16px;overflow:hidden;box-shadow:0 18px 40px rgba(0, 0, 0, 0.35);background:radial-gradient(circle at top left, #ffffff 0%, #f3f3f3 40%, #e4e4e4 100%)}.annotationLayer{position:absolute;inset:0;z-index:20;pointer-events:auto}.annotationRect{position:absolute;background:radial-gradient(circle at top left,\r\n    rgba(255, 255, 170, 0.55),\r\n    rgba(255, 210, 90, 0.35));border-radius:6px;box-shadow:0 0 0 1px rgba(255, 250, 200, 0.5),\r\n    0 0 18px rgba(255, 255, 150, 0.6);pointer-events:none}.comment-icon,.note-icon{position:absolute;font-size:18px;cursor:pointer;z-index:30;user-select:none;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);background:radial-gradient(circle at top left,\r\n    rgba(0, 180, 255, 0.9),\r\n    rgba(90, 70, 250, 0.9));box-shadow:0 6px 16px rgba(0, 0, 0, 0.35),\r\n    0 0 12px rgba(0, 184, 255, 0.7);color:#fdfdfd;transition:transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease}.note-icon{background:radial-gradient(circle at top left,\r\n    rgba(255, 140, 80, 0.95),\r\n    rgba(255, 77, 77, 0.95));box-shadow:0 6px 16px rgba(0, 0, 0, 0.35),\r\n    0 0 12px rgba(255, 130, 80, 0.8)}.comment-icon:hover,.note-icon:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 10px 28px rgba(0, 0, 0, 0.45),\r\n    0 0 16px rgba(0, 200, 255, 0.9)}.virtual-page-wrapper{width:100%;display:flex;justify-content:center;margin-bottom:20px}.note-bubble{position:absolute;max-width:240px;padding:10px 14px;font-size:13px;border-radius:12px;background:rgba(255, 250, 240, 0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 4px 18px rgba(0, 0, 0, 0.28),\r\n    0 0 12px rgba(255, 180, 120, 0.6);color:#4b2b1f;z-index:50;opacity:0;pointer-events:none;transform:translateY(-6px);transition:opacity 0.2s ease, transform 0.2s ease}.note-bubble.visible{opacity:1;transform:translateY(0px)}.note-bubble.left{transform:translate(-110%, -10%)}.note-bubble.right{transform:translate(32px, -10%)}.note-bubble{position:absolute;max-width:240px;padding:10px 14px;font-size:13px;border-radius:12px;background:rgba(255, 250, 240, 0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 4px 18px rgba(0, 0, 0, 0.28),\r\n    0 0 12px rgba(255, 180, 120, 0.6);color:#4b2b1f;z-index:50;opacity:0;pointer-events:none;transform:translateY(-6px);transition:opacity 0.2s ease, transform 0.2s ease}.note-bubble.visible{opacity:1;transform:translateY(0px)}.note-bubble.left{transform:translate(-110%, -10%)}.note-bubble.right{transform:translate(32px, -10%)}.pdfViewerPage.select-mode .textLayer{pointer-events:auto !important}";

const pdfjsLib = window.pdfjsLib;
const pdfjsViewer = window.pdfjsViewer;
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.js';
const DocPage = /*@__PURE__*/ proxyCustomElement(class DocPage extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.annotationCreated = createEvent(this, "annotationCreated");
        this.commentAddRequested = createEvent(this, "commentAddRequested");
        this.commentIconClicked = createEvent(this, "commentIconClicked");
    }
    get host() { return this; }
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
    static get watchers() { return {
        "visible": ["visibleChanged"],
        "annotations": ["annotationsChanged"],
        "comments": ["commentsChanged"],
        "activeTool": ["activeToolChanged"],
        "readOnly": ["readOnlyChanged"]
    }; }
    static get style() { return docPageCss; }
}, [768, "doc-page", {
        "src": [1],
        "page": [2],
        "scale": [2],
        "fileType": [1, "file-type"],
        "activeTool": [1, "active-tool"],
        "readOnly": [4, "read-only"],
        "visible": [4],
        "annotations": [16],
        "comments": [16]
    }, undefined, {
        "visible": ["visibleChanged"],
        "annotations": ["annotationsChanged"],
        "comments": ["commentsChanged"],
        "activeTool": ["activeToolChanged"],
        "readOnly": ["readOnlyChanged"]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["doc-page"];
    components.forEach(tagName => { switch (tagName) {
        case "doc-page":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, DocPage);
            }
            break;
    } });
}
defineCustomElement();

export { DocPage as D, defineCustomElement as d };
//# sourceMappingURL=p-zxZMLVxm.js.map

//# sourceMappingURL=p-zxZMLVxm.js.map