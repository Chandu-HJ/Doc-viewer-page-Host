'use strict';

var index = require('./index-CwZRCTZi.js');

const docPageCss = ".page-wrapper{margin:24px auto;position:relative;width:fit-content;max-width:100%}.pdfViewerPage .page{position:relative;border-radius:16px;overflow:hidden;box-shadow:0 18px 40px rgba(0, 0, 0, 0.35);background:radial-gradient(circle at top left, #ffffff 0%, #f3f3f3 40%, #e4e4e4 100%)}.annotationLayer{position:absolute;inset:0;z-index:20;pointer-events:auto}.annotationRect{position:absolute;background:radial-gradient(circle at top left,\r\n    rgba(255, 255, 170, 0.55),\r\n    rgba(255, 210, 90, 0.35));border-radius:6px;box-shadow:0 0 0 1px rgba(255, 250, 200, 0.5),\r\n    0 0 18px rgba(255, 255, 150, 0.6);pointer-events:none}.comment-icon,.note-icon{position:absolute;font-size:18px;cursor:pointer;z-index:30;user-select:none;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);background:radial-gradient(circle at top left,\r\n    rgba(0, 180, 255, 0.9),\r\n    rgba(90, 70, 250, 0.9));box-shadow:0 6px 16px rgba(0, 0, 0, 0.35),\r\n    0 0 12px rgba(0, 184, 255, 0.7);color:#fdfdfd;transition:transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease}.note-icon{background:radial-gradient(circle at top left,\r\n    rgba(255, 140, 80, 0.95),\r\n    rgba(255, 77, 77, 0.95));box-shadow:0 6px 16px rgba(0, 0, 0, 0.35),\r\n    0 0 12px rgba(255, 130, 80, 0.8)}.comment-icon:hover,.note-icon:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 10px 28px rgba(0, 0, 0, 0.45),\r\n    0 0 16px rgba(0, 200, 255, 0.9)}.virtual-page-wrapper{width:100%;display:flex;justify-content:center;margin-bottom:20px}.note-bubble{position:absolute;max-width:240px;padding:10px 14px;font-size:13px;border-radius:12px;background:rgba(255, 250, 240, 0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 4px 18px rgba(0, 0, 0, 0.28),\r\n    0 0 12px rgba(255, 180, 120, 0.6);color:#4b2b1f;z-index:50;opacity:0;pointer-events:none;transform:translateY(-6px);transition:opacity 0.2s ease, transform 0.2s ease}.note-bubble.visible{opacity:1;transform:translateY(0px)}.note-bubble.left{transform:translate(-110%, -10%)}.note-bubble.right{transform:translate(32px, -10%)}.note-bubble{position:absolute;max-width:240px;padding:10px 14px;font-size:13px;border-radius:12px;background:rgba(255, 250, 240, 0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 4px 18px rgba(0, 0, 0, 0.28),\r\n    0 0 12px rgba(255, 180, 120, 0.6);color:#4b2b1f;z-index:50;opacity:0;pointer-events:none;transform:translateY(-6px);transition:opacity 0.2s ease, transform 0.2s ease}.note-bubble.visible{opacity:1;transform:translateY(0px)}.note-bubble.left{transform:translate(-110%, -10%)}.note-bubble.right{transform:translate(32px, -10%)}.pdfViewerPage.select-mode .textLayer{pointer-events:auto !important}";

const pdfjsLib$1 = window.pdfjsLib;
const pdfjsViewer = window.pdfjsViewer;
pdfjsLib$1.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.js';
const DocPage = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
        this.annotationCreated = index.createEvent(this, "annotationCreated");
        this.commentAddRequested = index.createEvent(this, "commentAddRequested");
        this.commentIconClicked = index.createEvent(this, "commentIconClicked");
    }
    get host() { return index.getElement(this); }
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
        const loadingTask = pdfjsLib$1.getDocument(this.src);
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
        return (index.h("div", { key: 'c66d3053eb9f0aee149287d428fb7bfd0f6579c2', class: "page-wrapper" }, index.h("div", { key: 'bbe543561da64798a590abfcb7aaad5dfa4bfe45', class: "pdfViewerPage", ref: (el) => (this.viewerContainer = el) })));
    }
    static get watchers() { return {
        "visible": ["visibleChanged"],
        "annotations": ["annotationsChanged"],
        "comments": ["commentsChanged"],
        "activeTool": ["activeToolChanged"],
        "readOnly": ["readOnlyChanged"]
    }; }
};
DocPage.style = docPageCss;

// src/utils/history.ts
class HistoryManager {
    past = [];
    future = [];
    clone(state) {
        return JSON.parse(JSON.stringify(state));
    }
    pushState(state) {
        this.past.push(this.clone(state));
        this.future = []; // clear redo stack
    }
    undo(current) {
        if (this.past.length === 0)
            return null;
        const prev = this.past.pop();
        this.future.push(this.clone(current));
        return prev;
    }
    redo(current) {
        if (this.future.length === 0)
            return null;
        const next = this.future.pop();
        this.past.push(this.clone(current));
        return next;
    }
}

const docViewerCss = ".viewer-container{--toolbar-height:56px;--bg-light:linear-gradient(145deg,\r\n    #dffcf4 0%,\r\n    #eaf8ff 40%,\r\n    #f4eaff 100%\r\n  );--text-light:#0f1b27;--bg-dark:linear-gradient(145deg,\r\n    #0a1110 0%,\r\n    #080d0c 40%,\r\n    #050908 100%\r\n  );--text-dark:#e8f6f3;--bg-sepia:linear-gradient(145deg,\r\n    #f8efd9 0%,\r\n    #f4e3c3 40%,\r\n    #e7ceaa 100%\r\n  );--text-sepia:#3e2a15}.viewer-container{display:flex;flex-direction:column;height:100%;width:100%;overflow:hidden;background:var(--bg-light);color:var(--text-light)}.viewer-container.theme-dark{background:var(--bg-dark);color:var(--text-dark)}.viewer-container.theme-sepia{background:var(--bg-sepia);color:var(--text-sepia)}.toolbar{height:var(--toolbar-height);display:flex;align-items:center;gap:12px;padding:10px 18px;background:rgba(255, 255, 255, 0.45);border-bottom:1px solid rgba(255, 255, 255, 0.35);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 8px 22px rgba(0, 0, 0, 0.08);position:sticky;top:0;z-index:100}.theme-dark .toolbar{background:rgba(25, 33, 31, 0.5);border-bottom-color:rgba(80, 100, 95, 0.5);box-shadow:0 8px 18px rgba(0, 0, 0, 0.25)}.theme-sepia .toolbar{background:rgba(255, 245, 230, 0.55);border-bottom-color:rgba(180, 140, 100, 0.4)}.toolbar button,.toolbar select{padding:6px 14px;border-radius:999px;background:rgba(255, 255, 255, 0.65);border:1px solid rgba(255, 255, 255, 0.45);backdrop-filter:blur(12px);cursor:pointer;font-size:14px}.theme-dark .toolbar button,.theme-dark .toolbar select{background:rgba(22, 30, 28, 0.7);border-color:rgba(100, 120, 110, 0.6);color:#e9f7f4}.theme-sepia .toolbar button,.theme-sepia .toolbar select{background:rgba(255, 245, 230, 0.75);border-color:rgba(180, 140, 100, 0.55);color:#3d2a15}.toolbar button.active{background:#0d9b82;color:white;border-color:transparent;box-shadow:0 10px 24px rgba(13, 155, 130, 0.35)}.theme-sepia .toolbar button.active{background:#c77a42;box-shadow:0 10px 22px rgba(175, 110, 60, 0.35)}.viewer-main{display:flex;flex:1;overflow:hidden;height:calc(100vh - var(--toolbar-height))}.pdf-panel{flex:1;overflow-y:auto;padding:24px;display:flex;justify-content:center;align-items:flex-start;transition:margin-right 0.25s ease}.pdf-panel.has-sidebar{margin-right:330px}.pages-container{display:flex;flex-direction:column;align-items:center;gap:28px;width:100%}.comment-sidebar{width:330px;height:calc(100vh - var(--toolbar-height));position:fixed;right:0;top:var(--toolbar-height);overflow-y:auto;padding-bottom:16px;background:rgba(255, 255, 255, 0.55);border-left:1px solid rgba(255, 255, 255, 0.35);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:-8px 0 18px rgba(0, 0, 0, 0.15);z-index:200}.theme-dark .comment-sidebar{background:rgba(25, 33, 31, 0.55);border-left-color:rgba(80, 100, 95, 0.4);box-shadow:-8px 0 18px rgba(0, 0, 0, 0.32);color:#e8f6f3}.theme-sepia .comment-sidebar{background:rgba(255, 245, 230, 0.65);border-left-color:rgba(180, 140, 100, 0.45)}.sidebar-header{padding:16px;font-weight:600;font-size:15px;border-bottom:1px solid rgba(255, 255, 255, 0.35)}.theme-dark .sidebar-header{border-bottom-color:rgba(100, 120, 110, 0.35)}.theme-sepia .sidebar-header{border-bottom-color:rgba(180, 140, 100, 0.35)}.comment-list{padding:12px}.comment-item{padding:12px;border-radius:14px;background:rgba(255, 255, 255, 0.75);border:1px solid transparent;cursor:pointer;transition:0.15s ease}.comment-item:hover{transform:translateY(-2px);box-shadow:0 8px 18px rgba(13, 155, 130, 0.18)}.comment-item.selected{border-color:#0d9b82;background:#e1f8f3;box-shadow:0 10px 22px rgba(13, 155, 130, 0.25)}.theme-dark .comment-item.selected{background:rgba(30, 45, 42, 0.8);border-color:#0d9b82}.theme-sepia .comment-item.selected{background:#f5e7d2;border-color:#c77a42}.comment-editor{padding:14px;border-top:1px solid rgba(255, 255, 255, 0.35)}.theme-dark .comment-editor{border-top-color:rgba(100, 120, 110, 0.35)}.theme-sepia .comment-editor{border-top-color:rgba(180, 140, 100, 0.4)}.comment-editor textarea{width:100%;height:100px;padding:10px;border-radius:12px;background:rgba(255, 255, 255, 0.65);border:1px solid rgba(255, 255, 255, 0.45)}.theme-dark .comment-editor textarea{background:rgba(25, 33, 31, 0.7);border-color:rgba(80, 100, 95, 0.5);color:#def3ed}.theme-sepia .comment-editor textarea{background:rgba(255, 245, 230, 0.75);border-color:rgba(180, 140, 100, 0.5);color:#3e2a15}.editor-buttons{display:flex;gap:10px;margin-top:10px}.editor-buttons button{flex:1;padding:8px 12px;border-radius:999px;border:none;cursor:pointer;font-weight:600}.ai-tag-btn{background:#ffe08a}.delete-btn{background:#ff6b6b;color:white}";

const pdfjsLib = window.pdfjsLib;
const TAG_OPTIONS = ['None', 'Important', 'Todo', 'Question', 'Idea'];
const DocViewer = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    src;
    scale = 1.2;
    fileType = 'pdf';
    embedded = false;
    theme = 'light';
    mode = 'editor';
    numPages = 0;
    activeTool = 'select';
    annotations = {};
    comments = {};
    sidebarOpen = false;
    sidebarPage = null;
    sidebarSelectedId = null;
    sidebarDraftText = '';
    sidebarDraftTag = 'None';
    // virtual / lazy: which pages are visible
    visiblePages = { 1: true };
    history = new HistoryManager();
    fileInputEl;
    intersectionObserver;
    // ---------- STORAGE ----------
    storageKey(kind) {
        const base = this.src || 'default';
        const safe = base.replace(/[^a-z0-9]/gi, '_');
        return `dv_${kind}_${safe}`;
    }
    detectFileType(src) {
        const s = src.toLowerCase();
        if (s.endsWith('.pdf'))
            return 'pdf';
        if (s.match(/\.(png|jpe?g|gif|bmp|webp)$/))
            return 'image';
        if (s.match(/\.(txt|md)$/))
            return 'text';
        return 'text';
    }
    async componentDidLoad() {
        const url = new URL(window.location.href);
        if (url.searchParams.get('embedded') === 'true')
            this.embedded = true;
        const ann = localStorage.getItem(this.storageKey('annotations'));
        if (ann)
            this.annotations = JSON.parse(ann);
        const cm = localStorage.getItem(this.storageKey('comments'));
        if (cm)
            this.comments = JSON.parse(cm);
        if (!this.fileType)
            this.fileType = this.detectFileType(this.src);
        if (this.fileType === 'pdf') {
            const task = pdfjsLib.getDocument(this.src);
            const pdf = await task.promise;
            this.numPages = pdf.numPages;
        }
        else {
            this.numPages = 1;
        }
        this.history.pushState({
            annotations: this.annotations,
            comments: this.comments,
        });
        this.setupIntersectionObserver();
    }
    setupIntersectionObserver() {
        if (typeof IntersectionObserver === 'undefined')
            return;
        this.intersectionObserver = new IntersectionObserver((entries) => {
            const updated = { ...this.visiblePages };
            let changed = false;
            for (const entry of entries) {
                const el = entry.target;
                const pageStr = el.getAttribute('data-page');
                if (!pageStr)
                    continue;
                const page = parseInt(pageStr, 10);
                if (!page)
                    continue;
                if (entry.isIntersecting && !updated[page]) {
                    updated[page] = true;
                    changed = true;
                }
            }
            if (changed) {
                this.visiblePages = updated;
            }
        }, {
            threshold: 0.2,
        });
    }
    observePageContainer = (el, page) => {
        if (!el || !this.intersectionObserver)
            return;
        el.setAttribute('data-page', String(page));
        this.intersectionObserver.observe(el);
    };
    // ===== HISTORY =====
    pushHistory() {
        this.history.pushState({
            annotations: this.annotations,
            comments: this.comments,
        });
    }
    persist() {
        localStorage.setItem(this.storageKey('annotations'), JSON.stringify(this.annotations));
        localStorage.setItem(this.storageKey('comments'), JSON.stringify(this.comments));
    }
    undo = () => {
        const state = this.history.undo({
            annotations: this.annotations,
            comments: this.comments,
        });
        if (!state)
            return;
        this.annotations = state.annotations;
        this.comments = state.comments;
        this.persist();
    };
    redo = () => {
        const state = this.history.redo({
            annotations: this.annotations,
            comments: this.comments,
        });
        if (!state)
            return;
        this.annotations = state.annotations;
        this.comments = state.comments;
        this.persist();
    };
    // ===== EVENTS FROM PAGES =====
    handleAnnotationCreated = (ev) => {
        const { page, rect } = ev.detail;
        this.pushHistory();
        const clone = { ...this.annotations };
        const list = clone[page] ? [...clone[page]] : [];
        list.push(rect);
        clone[page] = list;
        this.annotations = clone;
        this.persist();
    };
    handleCommentAddRequested = (ev) => {
        this.pushHistory();
        const { page, x, y, kind } = ev.detail;
        const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
        const updated = { ...this.comments };
        const list = updated[page] ? [...updated[page]] : [];
        list.push({
            id,
            kind,
            x,
            y,
            text: '',
            tag: 'None',
            createdAt: new Date().toISOString(),
        });
        updated[page] = list;
        this.comments = updated;
        this.persist();
        this.sidebarOpen = true;
        this.sidebarPage = page;
        this.sidebarSelectedId = id;
        this.sidebarDraftText = '';
        this.sidebarDraftTag = 'None';
    };
    handleCommentIconClicked = (ev) => {
        const { page, commentId } = ev.detail;
        this.sidebarOpen = true;
        this.sidebarPage = page;
        this.sidebarSelectedId = commentId;
        const c = this.getComment(page, commentId);
        if (c) {
            this.sidebarDraftText = c.text;
            this.sidebarDraftTag = c.tag;
        }
    };
    getComment(page, id) {
        const list = this.comments[page] || [];
        return list.find((c) => c.id === id) || null;
    }
    // ===== TOOLBAR =====
    setTool(tool) {
        this.activeTool = tool;
    }
    // ===== SIDEBAR HELPERS =====
    getSidebarComments() {
        if (!this.sidebarPage)
            return [];
        return this.comments[this.sidebarPage] || [];
    }
    selectSidebarComment(id) {
        this.sidebarSelectedId = id;
        const c = this.sidebarPage ? this.getComment(this.sidebarPage, id) : null;
        if (c) {
            this.sidebarDraftText = c.text;
            this.sidebarDraftTag = c.tag;
        }
    }
    saveSidebarAnnotation = () => {
        if (!this.sidebarPage || !this.sidebarSelectedId)
            return;
        this.pushHistory();
        const page = this.sidebarPage;
        const list = [...(this.comments[page] || [])];
        const idx = list.findIndex((c) => c.id === this.sidebarSelectedId);
        if (idx < 0)
            return;
        list[idx] = {
            ...list[idx],
            text: this.sidebarDraftText,
            tag: this.sidebarDraftTag,
        };
        this.comments = { ...this.comments, [page]: list };
        this.persist();
    };
    async mockAITag(text) {
        const t = text.toLowerCase();
        if (!t.trim())
            return 'None';
        if (t.includes('?'))
            return 'Question';
        if (t.includes('important') || t.length > 80)
            return 'Important';
        if (t.includes('todo') || t.includes('fix'))
            return 'Todo';
        if (t.includes('idea'))
            return 'Idea';
        return 'Idea';
    }
    deleteSidebarAnnotation = () => {
        if (!this.sidebarPage || !this.sidebarSelectedId)
            return;
        this.pushHistory();
        const page = this.sidebarPage;
        const list = [...(this.comments[page] || [])];
        const updated = list.filter((c) => c.id !== this.sidebarSelectedId);
        this.comments = { ...this.comments, [page]: updated };
        this.persist();
        this.sidebarSelectedId = null;
        this.sidebarDraftText = '';
        this.sidebarDraftTag = 'None';
    };
    closeSidebar = () => {
        this.sidebarOpen = false;
        this.sidebarPage = null;
        this.sidebarSelectedId = null;
        this.sidebarDraftText = '';
        this.sidebarDraftTag = 'None';
    };
    // ===== EXPORT / IMPORT (STATE) =====
    exportJson = () => {
        const data = {
            version: 1,
            src: this.src,
            fileType: this.fileType,
            theme: this.theme,
            mode: this.mode,
            activeTool: this.activeTool,
            annotations: this.annotations,
            comments: this.comments,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'doc-viewer-state.json';
        a.click();
        URL.revokeObjectURL(url);
    };
    onImportFileChange = (e) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                this.pushHistory();
                this.annotations = data.annotations || {};
                this.comments = data.comments || {};
                if (data.theme)
                    this.theme = data.theme;
                if (data.mode)
                    this.mode = data.mode;
                if (data.activeTool)
                    this.activeTool = data.activeTool;
                this.persist();
            }
            catch {
                // ignore
            }
            finally {
                input.value = '';
            }
        };
        reader.readAsText(file);
    };
    // ===== SIDEBAR UI =====
    renderSidebar() {
        if (!this.sidebarOpen || !this.sidebarPage)
            return null;
        const pageComments = this.getSidebarComments();
        const readOnly = this.mode === 'viewer' || this.embedded;
        const selected = this.sidebarSelectedId &&
            pageComments.find((c) => c.id === this.sidebarSelectedId);
        return (index.h("div", { class: "comment-sidebar" }, index.h("div", { class: "sidebar-header" }, index.h("strong", null, "Annotations \u2013 Page ", this.sidebarPage), index.h("button", { class: "close-btn", onClick: this.closeSidebar }, "\u2715")), index.h("div", { class: "comment-list" }, pageComments.length === 0 ? (index.h("div", { class: "empty" }, "No comments or notes yet.")) : (pageComments.map((c) => (index.h("div", { class: {
                'comment-item': true,
                selected: c.id === this.sidebarSelectedId,
            }, onClick: () => this.selectSidebarComment(c.id) }, index.h("div", { class: "comment-meta" }, index.h("span", { class: "kind-pill" }, c.kind === 'comment' ? 'Comment' : 'Note'), index.h("span", { class: "meta-time" }, " \u2022 ", new Date(c.createdAt).toLocaleString())), index.h("div", { class: "comment-meta tag-line" }, "Tag: ", c.tag), index.h("div", { class: "comment-text-preview" }, c.text ? c.text.slice(0, 80) : '(no text yet)')))))), index.h("div", { class: "comment-editor" }, selected ? (index.h(index.h.Fragment, null, index.h("div", { class: "editor-meta" }, "Editing ", selected.kind, " created ", new Date(selected.createdAt).toLocaleString()), index.h("label", { class: "tag-label" }, "Tag:", index.h("select", { disabled: readOnly, onChange: (e) => (this.sidebarDraftTag = e.target.value) }, TAG_OPTIONS.map((t) => (index.h("option", { value: t, selected: this.sidebarDraftTag === t }, t))))), index.h("textarea", { value: this.sidebarDraftText, disabled: readOnly, onInput: (e) => (this.sidebarDraftText = e.target.value), placeholder: "Type annotation details here..." }), index.h("div", { class: "editor-buttons" }, index.h("button", { disabled: readOnly, onClick: this.saveSidebarAnnotation }, "Save"), index.h("button", { class: "ai-tag-btn", disabled: readOnly, onClick: async () => {
                this.sidebarDraftTag = await this.mockAITag(this.sidebarDraftText);
                this.saveSidebarAnnotation();
            } }, "\uD83E\uDD16 Auto-Tag"), index.h("button", { class: "delete-btn", disabled: readOnly, onClick: this.deleteSidebarAnnotation }, "\uD83D\uDDD1 Delete")))) : (index.h("div", { class: "editor-meta" }, "Click a comment or note icon on the doc.")))));
    }
    // ===== MAIN RENDER =====
    render() {
        const readOnly = this.mode === 'viewer' || this.embedded;
        const pages = Array.from({ length: this.numPages || 0 }, (_, i) => i + 1);
        return (index.h("div", { key: '223069720ac91636227a6a33069a1afbe7abdf2e', class: `viewer-container theme-${this.theme}` }, !this.embedded && (index.h("div", { key: '5ef94daff315d0347db65261fdb93f597902048d', class: "toolbar" }, index.h("button", { key: '7bfbcc711d5a62ff7b1a5df9e113b76b2bedf1f9', disabled: readOnly, class: this.activeTool === 'select' ? 'active' : '', onClick: () => this.setTool('select') }, "Select"), index.h("button", { key: 'cf2613b858e8c581f99159758850e722522b953e', disabled: readOnly, class: this.activeTool === 'highlight' ? 'active' : '', onClick: () => this.setTool('highlight') }, "Highlight"), index.h("button", { key: 'cb86bcb6622c3ffa9daa878e2a40d66244420281', disabled: readOnly, class: this.activeTool === 'comment' ? 'active' : '', onClick: () => this.setTool('comment') }, "Comment"), index.h("button", { key: '56ca7c23e4d339c663a09098282279a03d856d5a', disabled: readOnly, class: this.activeTool === 'note' ? 'active' : '', onClick: () => this.setTool('note') }, "Note"), index.h("div", { key: '4a98f6db2a15b5e0c52f586b344be406ad071d37', class: "toolbar-spacer" }), index.h("button", { key: '7a574acb41a8c3db81d31325f3bc6bb926a80aa7', disabled: readOnly, onClick: this.undo }, "\u293A Undo"), index.h("button", { key: 'd4bb6113e31041b52e5c18aa1cfa23f2606c8a90', disabled: readOnly, onClick: this.redo }, "\u293C Redo"), index.h("div", { key: '8d359e25665d72d2d046916aa7df97607f493ae8', class: "toolbar-spacer" }), index.h("button", { key: '5bd424113a03f321d78adadd524416cfe9bdbf9f', onClick: this.exportJson }, "\u2B06 Export"), index.h("button", { key: '642033dbcacdd6076e4f4905eceb28b3fdc1aec2', disabled: readOnly, onClick: () => this.fileInputEl?.click() }, "\u2B07 Import"), index.h("input", { key: '8e83a854e66fca389fb45dfe9b6dea0494de4e8f', type: "file", accept: "application/json", style: { display: 'none' }, ref: (el) => (this.fileInputEl = el), onChange: this.onImportFileChange }), index.h("label", { key: 'f3fb274f9c1ceacff2d5b2b3f72a5c812590ab6d' }, "Theme:"), index.h("select", { key: 'c9a01eea00d6a6eaf8b1ea5a81e801b469a52d38', onChange: (e) => (this.theme = e.target.value) }, index.h("option", { key: 'e7be10f8e778afe989ae8ac8839a393215aa85b8', value: "light", selected: this.theme === 'light' }, "Light"), index.h("option", { key: 'dc4b07530a737a3cedb5d77b0e93721f2d1fece2', value: "dark", selected: this.theme === 'dark' }, "Dark"), index.h("option", { key: '191782ace171d381600a523c0b2ef68b0674995d', value: "sepia", selected: this.theme === 'sepia' }, "Sepia")), index.h("label", { key: '72f7bb2dad4adade8378e3961f9b6c48435b3b37' }, "Mode:"), index.h("select", { key: '9f2b4ed099bbe61aca1daa8c2eac097c69dd9b7b', onChange: (e) => (this.mode = e.target.value) }, index.h("option", { key: '765a980587716ed7f37f0081cb600443e53fab5b', value: "editor", selected: this.mode === 'editor' }, "Editor"), index.h("option", { key: 'a7e5e6b11d88c74f10d47af5687d8442d581f191', value: "viewer", selected: this.mode === 'viewer' }, "Viewer")))), index.h("div", { key: '56284ffda518bbdb201ca2be2ec233d205ba4396', class: "viewer-main" }, index.h("div", { key: '1c81e83ade1da038adef7e53936ecfc90976a21e', class: {
                'pdf-panel': true,
                'has-sidebar': this.sidebarOpen,
            } }, index.h("div", { key: 'f06332e958946313e6af80c72e70049043136d69', class: "pages-container" }, pages.map((pageNum) => (index.h("div", { class: "virtual-page-wrapper", ref: (el) => this.observePageContainer(el, pageNum) }, index.h("doc-page", { src: this.src, page: pageNum, key: pageNum, scale: this.scale, fileType: this.fileType, readOnly: readOnly, activeTool: this.activeTool, visible: !!this.visiblePages[pageNum], annotations: this.annotations[pageNum] || [], comments: this.comments[pageNum] || [], onAnnotationCreated: this.handleAnnotationCreated, onCommentAddRequested: this.handleCommentAddRequested, onCommentIconClicked: this.handleCommentIconClicked })))))), !this.embedded && this.renderSidebar())));
    }
};
DocViewer.style = docViewerCss;

const docWorkspaceCss = ".workspace-container{display:flex;flex-direction:column;height:100%;width:100%;font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif}.theme-light.workspace-container{background:linear-gradient(145deg,\r\n    #dffcf4 0%,\r\n    #eaf8ff 40%,\r\n    #f4eaff 100%\r\n  );color:#0f1b27}.theme-dark.workspace-container{background:linear-gradient(145deg,\r\n    #0a1110 0%,\r\n    #080d0c 40%,\r\n    #050908 100%\r\n  );color:#e9f7f4}.theme-sepia.workspace-container{background:linear-gradient(145deg,\r\n    #f8efd9 0%,\r\n    #f4e3c3 40%,\r\n    #e7ceaa 100%\r\n  );color:#3e2a15}.workspace-toolbar{display:flex;align-items:center;padding:10px 16px;gap:12px;background:rgba(255, 255, 255, 0.45);border-bottom:1px solid rgba(255, 255, 255, 0.35);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 8px 22px rgba(0, 0, 0, 0.10);z-index:20}.theme-dark .workspace-toolbar{background:rgba(20, 28, 26, 0.45);border-bottom-color:rgba(70, 85, 80, 0.45);box-shadow:0 8px 22px rgba(0, 0, 0, 0.30)}.theme-sepia .workspace-toolbar{background:rgba(255, 245, 230, 0.55);border-bottom-color:rgba(180, 140, 100, 0.45)}.open-btn{padding:7px 16px;border-radius:999px;border:none;background:#0d9b82;color:white;cursor:pointer;box-shadow:0 10px 24px rgba(13, 155, 130, 0.35);transition:0.15s ease}.open-btn:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(13, 155, 130, 0.45)}.theme-dark .open-btn{background:#0d9b82;box-shadow:none}.theme-sepia .open-btn{background:#c97b43;box-shadow:0 10px 22px rgba(175, 110, 60, 0.45)}.theme-select{padding:6px 12px;border-radius:999px;background:rgba(255, 255, 255, 0.65);border:1px solid rgba(255, 255, 255, 0.45);backdrop-filter:blur(12px);cursor:pointer;font-size:13px;color:inherit}.theme-dark .theme-select{background:rgba(25, 34, 32, 0.7);border-color:rgba(100, 120, 110, 0.55);color:#def3ed}.theme-sepia .theme-select{background:rgba(255, 245, 230, 0.75);border-color:rgba(180, 140, 100, 0.55);color:#3e2a15}.workspace-tabs{display:flex;overflow-x:auto;gap:6px;padding:6px 10px;background:rgba(255, 255, 255, 0.30);border-bottom:1px solid rgba(255, 255, 255, 0.25);backdrop-filter:blur(14px)}.theme-dark .workspace-tabs{background:rgba(25, 33, 31, 0.35);border-bottom-color:rgba(80, 95, 90, 0.45)}.theme-sepia .workspace-tabs{background:rgba(255, 245, 233, 0.55);border-bottom-color:rgba(180, 140, 100, 0.45)}.tab{padding:7px 14px;border-radius:12px;cursor:pointer;background:rgba(255, 255, 255, 0.75);border:1px solid rgba(255, 255, 255, 0.45);transition:0.15s ease}.tab:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(13, 155, 130, 0.15)}.theme-dark .tab{background:rgba(25, 33, 31, 0.8);border-color:rgba(80, 100, 95, 0.4);color:#def3ed}.theme-sepia .tab{background:rgba(255, 245, 233, 0.8);border-color:rgba(180, 140, 100, 0.4)}.tab.active{background:#0d9b82;color:white;border-color:transparent;box-shadow:0 10px 22px rgba(13, 155, 130, 0.35)}.theme-sepia .tab.active{background:#c77a42}.workspace-viewer{flex:1;overflow:hidden;position:relative}.empty{padding:40px;text-align:center;opacity:0.7;font-size:18px}";

const DocWorkspace = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    scale = 1.2;
    files = [];
    activeId = null;
    // ⭐ Global theme state (affects viewer + workspace)
    theme = 'light';
    fileInput;
    // ------------------------------------------------------------
    // FILE UPLOAD
    // ------------------------------------------------------------
    onFileSelected = (e) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file)
            return;
        const ext = file.name.toLowerCase();
        const id = Date.now().toString();
        let fileType = 'text';
        if (ext.endsWith('.pdf'))
            fileType = 'pdf';
        else if (ext.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/))
            fileType = 'image';
        const url = URL.createObjectURL(file);
        this.files = [
            ...this.files,
            {
                id,
                name: file.name,
                url,
                fileType,
            },
        ];
        this.activeId = id;
        input.value = '';
    };
    // ------------------------------------------------------------
    // CLOSE TAB
    // ------------------------------------------------------------
    closeFile(id) {
        this.files = this.files.filter((f) => f.id !== id);
        if (this.activeId === id) {
            this.activeId = this.files.length ? this.files[0].id : null;
        }
    }
    // ------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------
    render() {
        const activeFile = this.files.find((f) => f.id === this.activeId);
        return (index.h("div", { key: '1fe9a7de7abb1d3f694bd757ac638b709677327c', class: `workspace-container theme-${this.theme}` }, index.h("div", { key: 'd6a3873178e1b4f2068e3342bd45db031b06cd12', class: "workspace-toolbar" }, index.h("button", { key: '2f1e333c61ac0fd18f6f03fb0b306dab7a26e385', class: "open-btn", onClick: () => this.fileInput?.click() }, "\uD83D\uDCC2 Open File"), index.h("input", { key: 'ea9daeb88184063b7d5c2075ec59979094cacfa9', type: "file", accept: ".pdf,.png,.jpg,.jpeg,.gif,.bmp,.webp,.txt,.md", style: { display: 'none' }, ref: (el) => (this.fileInput = el), onChange: this.onFileSelected }), index.h("div", { key: '5fefbf76312251ebd641af0358bc5762a0309e55', class: "toolbar-spacer" }), index.h("label", { key: 'd7e9206aa459270475b0c01b29cec4c0c89cdae1', class: "theme-label" }, "Theme:"), index.h("select", { key: '86e27cc8a67fe702a51bf9d2d595aaacb7cb50b6', class: "theme-select", onChange: (e) => {
                this.theme = e.target.value;
            } }, index.h("option", { key: 'b80c6cbe732d0d0602901e95d5127ace554db2c0', value: "light", selected: this.theme === 'light' }, "Light"), index.h("option", { key: '94b284488b10ee8ff1bac868a953877565391a16', value: "dark", selected: this.theme === 'dark' }, "Dark"), index.h("option", { key: '0f65f78f34bf6e5c2ff3c34367310aca0bb9934c', value: "sepia", selected: this.theme === 'sepia' }, "Sepia"))), index.h("div", { key: '30d0c57310f183618b069f56315493cb6de43a3c', class: "workspace-tabs" }, this.files.map((file) => (index.h("div", { class: {
                tab: true,
                active: file.id === this.activeId,
            }, onClick: () => (this.activeId = file.id) }, file.name, index.h("span", { class: "close-x", onClick: (ev) => {
                ev.stopPropagation();
                this.closeFile(file.id);
            } }, "\u2716"))))), index.h("div", { key: '2d6c9175ecf8e96bfc2719375337efe1bce9fda0', class: "workspace-viewer" }, activeFile ? (index.h("doc-viewer", { key: activeFile.id, src: activeFile.url, fileType: activeFile.fileType, scale: this.scale, theme: this.theme, mode: "editor" // default for workspace
        })) : (index.h("div", { class: "empty" }, "No file opened. Click ", index.h("b", null, "Open File"), ".")))));
    }
};
DocWorkspace.style = docWorkspaceCss;

exports.doc_page = DocPage;
exports.doc_viewer = DocViewer;
exports.doc_workspace = DocWorkspace;
//# sourceMappingURL=doc-page.doc-viewer.doc-workspace.entry.cjs.js.map
