import { r as registerInstance, c as createEvent, g as getElement, h } from './index-C3ydJ6WH.js';

const docPageCss = ".page-wrapper{margin:24px auto;position:relative;width:fit-content;max-width:100%}.pdfViewerPage .page{position:relative;border-radius:16px;overflow:hidden;box-shadow:0 18px 40px rgba(0, 0, 0, 0.35);background:radial-gradient(circle at top left, #ffffff 0%, #f3f3f3 40%, #e4e4e4 100%)}.annotationLayer{position:absolute;inset:0;z-index:20;pointer-events:auto}.annotationRect{position:absolute;background:radial-gradient(circle at top left,\r\n    rgba(255, 255, 170, 0.55),\r\n    rgba(255, 210, 90, 0.35));border-radius:6px;box-shadow:0 0 0 1px rgba(255, 250, 200, 0.5),\r\n    0 0 18px rgba(255, 255, 150, 0.6);pointer-events:none}.comment-icon,.note-icon{position:absolute;font-size:18px;cursor:pointer;z-index:30;user-select:none;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);background:radial-gradient(circle at top left,\r\n    rgba(0, 180, 255, 0.9),\r\n    rgba(90, 70, 250, 0.9));box-shadow:0 6px 16px rgba(0, 0, 0, 0.35),\r\n    0 0 12px rgba(0, 184, 255, 0.7);color:#fdfdfd;transition:transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease}.note-icon{background:radial-gradient(circle at top left,\r\n    rgba(255, 140, 80, 0.95),\r\n    rgba(255, 77, 77, 0.95));box-shadow:0 6px 16px rgba(0, 0, 0, 0.35),\r\n    0 0 12px rgba(255, 130, 80, 0.8)}.comment-icon:hover,.note-icon:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 10px 28px rgba(0, 0, 0, 0.45),\r\n    0 0 16px rgba(0, 200, 255, 0.9)}.virtual-page-wrapper{width:100%;display:flex;justify-content:center;margin-bottom:20px}.note-bubble{position:absolute;max-width:240px;padding:10px 14px;font-size:13px;border-radius:12px;background:rgba(255, 250, 240, 0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 4px 18px rgba(0, 0, 0, 0.28),\r\n    0 0 12px rgba(255, 180, 120, 0.6);color:#4b2b1f;z-index:50;opacity:0;pointer-events:none;transform:translateY(-6px);transition:opacity 0.2s ease, transform 0.2s ease}.note-bubble.visible{opacity:1;transform:translateY(0px)}.note-bubble.left{transform:translate(-110%, -10%)}.note-bubble.right{transform:translate(32px, -10%)}.note-bubble{position:absolute;max-width:240px;padding:10px 14px;font-size:13px;border-radius:12px;background:rgba(255, 250, 240, 0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 4px 18px rgba(0, 0, 0, 0.28),\r\n    0 0 12px rgba(255, 180, 120, 0.6);color:#4b2b1f;z-index:50;opacity:0;pointer-events:none;transform:translateY(-6px);transition:opacity 0.2s ease, transform 0.2s ease}.note-bubble.visible{opacity:1;transform:translateY(0px)}.note-bubble.left{transform:translate(-110%, -10%)}.note-bubble.right{transform:translate(32px, -10%)}.pdfViewerPage.select-mode .textLayer{pointer-events:auto !important}";

const pdfjsLib$1 = window.pdfjsLib;
const pdfjsViewer = window.pdfjsViewer;
pdfjsLib$1.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.js';
const DocPage = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.annotationCreated = createEvent(this, "annotationCreated");
        this.commentAddRequested = createEvent(this, "commentAddRequested");
        this.commentIconClicked = createEvent(this, "commentIconClicked");
    }
    get host() { return getElement(this); }
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
        return (h("div", { key: 'c66d3053eb9f0aee149287d428fb7bfd0f6579c2', class: "page-wrapper" }, h("div", { key: 'bbe543561da64798a590abfcb7aaad5dfa4bfe45', class: "pdfViewerPage", ref: (el) => (this.viewerContainer = el) })));
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

const docViewerCss = ".viewer-container{--toolbar-height:56px;--bg-light:radial-gradient(circle at top left, #f2f6ff 0%, #fdfdff 35%, #e7f0ff 100%);--bg-dark:radial-gradient(circle at top left, #050814 0%, #050812 40%, #020208 100%);--bg-sepia:radial-gradient(circle at top left, #f9f1da 0%, #f5e4c0 40%, #e3cba0 100%);--text-main-light:#0a1020;--text-main-dark:#f6f7ff;--text-main-sepia:#3d2a16}.viewer-container{display:flex;flex-direction:column;height:100%;width:100%;overflow:hidden;font-family:system-ui, -apple-system, BlinkMacSystemFont, sans-serif;background:var(--bg-light);color:var(--text-main-light)}.viewer-container.theme-dark{background:var(--bg-dark);color:var(--text-main-dark)}.viewer-container.theme-sepia{background:var(--bg-sepia);color:var(--text-main-sepia)}.toolbar{height:var(--toolbar-height);display:flex;align-items:center;gap:12px;padding:12px 20px;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(255, 255, 255, 0.18);border-bottom:1px solid rgba(255, 255, 255, 0.35);position:sticky;top:0;z-index:200}.theme-dark .toolbar{background:rgba(18, 24, 48, 0.55);border-bottom-color:rgba(90, 110, 180, 0.7)}.toolbar button,.toolbar select{padding:6px 14px;border-radius:999px;border:1px solid rgba(255, 255, 255, 0.5);background:rgba(255, 255, 255, 0.7);cursor:pointer;font-size:14px;transition:0.2s ease;backdrop-filter:blur(16px)}.theme-dark .toolbar button,.theme-dark .toolbar select{background:rgba(20, 25, 50, 0.85);color:#fff;border-color:rgba(120, 145, 220, 0.9)}.toolbar button.active{background:linear-gradient(135deg, #4c8dff, #7d5cff);color:white;box-shadow:0 12px 25px rgba(70, 110, 255, 0.5),\r\n    0 2px 14px rgba(115, 150, 255, 0.6)}.viewer-main{display:flex;flex:1;overflow:hidden;height:calc(100vh - var(--toolbar-height))}.pdf-panel{flex:1;overflow-y:auto;padding:24px;width:100%;display:flex;justify-content:center;align-items:flex-start;transition:margin-right 0.3s ease}.pdf-panel.has-sidebar{margin-right:330px}.pages-container{display:flex;flex-direction:column;gap:28px;width:100%;align-items:center}.comment-sidebar{width:330px;height:calc(100vh - var(--toolbar-height));position:fixed;top:var(--toolbar-height);right:0;overflow-y:auto;padding-bottom:20px;background:linear-gradient(145deg,\r\n    rgba(255, 255, 255, 0.88),\r\n    rgba(240, 243, 255, 0.92));border-left:1px solid rgba(210, 220, 245, 0.85);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);box-shadow:-10px 0px 25px rgba(0, 0, 0, 0.25),\r\n              0 0 16px rgba(120, 160, 255, 0.35);z-index:500;}.theme-dark .comment-sidebar{background:linear-gradient(145deg,\r\n    rgba(15, 20, 45, 0.95),\r\n    rgba(10, 14, 32, 0.93));border-left-color:rgba(90, 110, 180, 0.85)}.sidebar-header{padding:16px;font-size:15px;font-weight:600;border-bottom:1px solid rgba(200, 210, 230, 0.7)}.comment-list{padding:12px}.comment-item{padding:10px 12px;border-radius:14px;margin-bottom:10px;background:rgba(255, 255, 255, 0.75);cursor:pointer;transition:0.2s ease;border:1px solid transparent}.comment-item:hover{transform:translateY(-2px);box-shadow:0 6px 15px rgba(70, 110, 255, 0.18)}.comment-item.selected{border-color:#6e92ff;background:radial-gradient(circle, #f0f4ff, #dde6ff);box-shadow:0 8px 18px rgba(70, 110, 255, 0.4),\r\n    0 0 14px rgba(120, 150, 255, 0.5)}.comment-editor{padding:14px;border-top:1px solid rgba(200, 210, 220, 0.8)}.comment-editor textarea{width:100%;height:90px;border-radius:12px;padding:10px;border:1px solid rgba(180, 190, 210, 0.8)}.editor-buttons{display:flex;gap:10px;margin-top:10px}.editor-buttons button{flex:1;border:none;padding:8px 10px;border-radius:999px;cursor:pointer;font-weight:600}.ai-tag-btn{background:linear-gradient(135deg, #ffdd7c, #ffb347)}.delete-btn{background:linear-gradient(135deg, #ff6b6b, #ff3b3b);color:#fff}.loading{padding:40px;font-size:18px;opacity:0.7}.virtual-page-wrapper{width:100%;display:flex;justify-content:center}.virtual-placeholder{width:800px;max-width:100%;height:1100px;border-radius:16px;opacity:0;}.viewer-container{display:flex;flex-direction:column;height:100vh;width:100%;font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;overflow:hidden;position:relative;}.toolbar{position:sticky;top:0;z-index:50;}.viewer-main{display:flex;flex:1;overflow:hidden;}.pdf-panel{flex:1;overflow-y:auto;padding:22px 28px;display:flex;justify-content:center;box-sizing:border-box;transition:margin-right 0.25s ease}.theme-dark .comment-sidebar,.theme-dark .comment-item,.theme-dark .comment-editor,.theme-dark .comment-list,.theme-dark .sidebar-header{color:#e9ecff !important;}.theme-dark .comment-item .comment-text-preview,.theme-dark .comment-item .comment-meta,.theme-dark .comment-item .meta-time,.theme-dark .comment-meta.tag-line{color:#d7dbff !important;}.theme-dark .comment-item.selected{background:rgba(40, 50, 90, 0.7) !important;border-color:#8fa7ff !important}.theme-dark .comment-editor textarea,.theme-dark .comment-editor select{background:rgba(20, 25, 50, 0.8) !important;color:#f0f2fc !important;border-color:rgba(120, 145, 220, 0.7) !important}.theme-dark .comment-editor button{color:#230372 !important}.theme-dark .comment-list{color:#0f1645 !important}";

const pdfjsLib = window.pdfjsLib;
const TAG_OPTIONS = ['None', 'Important', 'Todo', 'Question', 'Idea'];
const DocViewer = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        return (h("div", { class: "comment-sidebar" }, h("div", { class: "sidebar-header" }, h("strong", null, "Annotations \u2013 Page ", this.sidebarPage), h("button", { class: "close-btn", onClick: this.closeSidebar }, "\u2715")), h("div", { class: "comment-list" }, pageComments.length === 0 ? (h("div", { class: "empty" }, "No comments or notes yet.")) : (pageComments.map((c) => (h("div", { class: {
                'comment-item': true,
                selected: c.id === this.sidebarSelectedId,
            }, onClick: () => this.selectSidebarComment(c.id) }, h("div", { class: "comment-meta" }, h("span", { class: "kind-pill" }, c.kind === 'comment' ? 'Comment' : 'Note'), h("span", { class: "meta-time" }, " \u2022 ", new Date(c.createdAt).toLocaleString())), h("div", { class: "comment-meta tag-line" }, "Tag: ", c.tag), h("div", { class: "comment-text-preview" }, c.text ? c.text.slice(0, 80) : '(no text yet)')))))), h("div", { class: "comment-editor" }, selected ? (h(h.Fragment, null, h("div", { class: "editor-meta" }, "Editing ", selected.kind, " created ", new Date(selected.createdAt).toLocaleString()), h("label", { class: "tag-label" }, "Tag:", h("select", { disabled: readOnly, onChange: (e) => (this.sidebarDraftTag = e.target.value) }, TAG_OPTIONS.map((t) => (h("option", { value: t, selected: this.sidebarDraftTag === t }, t))))), h("textarea", { value: this.sidebarDraftText, disabled: readOnly, onInput: (e) => (this.sidebarDraftText = e.target.value), placeholder: "Type annotation details here..." }), h("div", { class: "editor-buttons" }, h("button", { disabled: readOnly, onClick: this.saveSidebarAnnotation }, "Save"), h("button", { class: "ai-tag-btn", disabled: readOnly, onClick: async () => {
                this.sidebarDraftTag = await this.mockAITag(this.sidebarDraftText);
                this.saveSidebarAnnotation();
            } }, "\uD83E\uDD16 Auto-Tag"), h("button", { class: "delete-btn", disabled: readOnly, onClick: this.deleteSidebarAnnotation }, "\uD83D\uDDD1 Delete")))) : (h("div", { class: "editor-meta" }, "Click a comment or note icon on the doc.")))));
    }
    // ===== MAIN RENDER =====
    render() {
        const readOnly = this.mode === 'viewer' || this.embedded;
        const pages = Array.from({ length: this.numPages || 0 }, (_, i) => i + 1);
        return (h("div", { key: '223069720ac91636227a6a33069a1afbe7abdf2e', class: `viewer-container theme-${this.theme}` }, !this.embedded && (h("div", { key: '5ef94daff315d0347db65261fdb93f597902048d', class: "toolbar" }, h("button", { key: '7bfbcc711d5a62ff7b1a5df9e113b76b2bedf1f9', disabled: readOnly, class: this.activeTool === 'select' ? 'active' : '', onClick: () => this.setTool('select') }, "Select"), h("button", { key: 'cf2613b858e8c581f99159758850e722522b953e', disabled: readOnly, class: this.activeTool === 'highlight' ? 'active' : '', onClick: () => this.setTool('highlight') }, "Highlight"), h("button", { key: 'cb86bcb6622c3ffa9daa878e2a40d66244420281', disabled: readOnly, class: this.activeTool === 'comment' ? 'active' : '', onClick: () => this.setTool('comment') }, "Comment"), h("button", { key: '56ca7c23e4d339c663a09098282279a03d856d5a', disabled: readOnly, class: this.activeTool === 'note' ? 'active' : '', onClick: () => this.setTool('note') }, "Note"), h("div", { key: '4a98f6db2a15b5e0c52f586b344be406ad071d37', class: "toolbar-spacer" }), h("button", { key: '7a574acb41a8c3db81d31325f3bc6bb926a80aa7', disabled: readOnly, onClick: this.undo }, "\u293A Undo"), h("button", { key: 'd4bb6113e31041b52e5c18aa1cfa23f2606c8a90', disabled: readOnly, onClick: this.redo }, "\u293C Redo"), h("div", { key: '8d359e25665d72d2d046916aa7df97607f493ae8', class: "toolbar-spacer" }), h("button", { key: '5bd424113a03f321d78adadd524416cfe9bdbf9f', onClick: this.exportJson }, "\u2B06 Export"), h("button", { key: '642033dbcacdd6076e4f4905eceb28b3fdc1aec2', disabled: readOnly, onClick: () => this.fileInputEl?.click() }, "\u2B07 Import"), h("input", { key: '8e83a854e66fca389fb45dfe9b6dea0494de4e8f', type: "file", accept: "application/json", style: { display: 'none' }, ref: (el) => (this.fileInputEl = el), onChange: this.onImportFileChange }), h("label", { key: 'f3fb274f9c1ceacff2d5b2b3f72a5c812590ab6d' }, "Theme:"), h("select", { key: 'c9a01eea00d6a6eaf8b1ea5a81e801b469a52d38', onChange: (e) => (this.theme = e.target.value) }, h("option", { key: 'e7be10f8e778afe989ae8ac8839a393215aa85b8', value: "light", selected: this.theme === 'light' }, "Light"), h("option", { key: 'dc4b07530a737a3cedb5d77b0e93721f2d1fece2', value: "dark", selected: this.theme === 'dark' }, "Dark"), h("option", { key: '191782ace171d381600a523c0b2ef68b0674995d', value: "sepia", selected: this.theme === 'sepia' }, "Sepia")), h("label", { key: '72f7bb2dad4adade8378e3961f9b6c48435b3b37' }, "Mode:"), h("select", { key: '9f2b4ed099bbe61aca1daa8c2eac097c69dd9b7b', onChange: (e) => (this.mode = e.target.value) }, h("option", { key: '765a980587716ed7f37f0081cb600443e53fab5b', value: "editor", selected: this.mode === 'editor' }, "Editor"), h("option", { key: 'a7e5e6b11d88c74f10d47af5687d8442d581f191', value: "viewer", selected: this.mode === 'viewer' }, "Viewer")))), h("div", { key: '56284ffda518bbdb201ca2be2ec233d205ba4396', class: "viewer-main" }, h("div", { key: '1c81e83ade1da038adef7e53936ecfc90976a21e', class: {
                'pdf-panel': true,
                'has-sidebar': this.sidebarOpen,
            } }, h("div", { key: 'f06332e958946313e6af80c72e70049043136d69', class: "pages-container" }, pages.map((pageNum) => (h("div", { class: "virtual-page-wrapper", ref: (el) => this.observePageContainer(el, pageNum) }, h("doc-page", { src: this.src, page: pageNum, key: pageNum, scale: this.scale, fileType: this.fileType, readOnly: readOnly, activeTool: this.activeTool, visible: !!this.visiblePages[pageNum], annotations: this.annotations[pageNum] || [], comments: this.comments[pageNum] || [], onAnnotationCreated: this.handleAnnotationCreated, onCommentAddRequested: this.handleCommentAddRequested, onCommentIconClicked: this.handleCommentIconClicked })))))), !this.embedded && this.renderSidebar())));
    }
};
DocViewer.style = docViewerCss;

const docWorkspaceCss = ".workspace-container{display:flex;flex-direction:column;height:100%;width:100%;font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;background:radial-gradient(circle at top left, #070b19 0%, #050817 40%, #02020a 100%);color:#f5f7ff}.theme-light.workspace-container{background:radial-gradient(circle at top left, #e7f0ff 0%, #f7faff 40%, #dfe8ff 100%);color:#0d1020}.theme-dark.workspace-container{background:radial-gradient(circle at top left, #060814 0%, #050811 40%, #020207 100%);color:#f5f7ff}.theme-sepia.workspace-container{background:radial-gradient(circle at top left, #f8efd9 0%, #f3e0c0 40%, #e3c79c 100%);color:#3d2712}.workspace-toolbar{display:flex;align-items:center;padding:10px 16px;gap:12px;border-bottom:1px solid rgba(255, 255, 255, 0.18);background:linear-gradient(120deg,\r\n    rgba(255, 255, 255, 0.18),\r\n    rgba(255, 255, 255, 0.04));backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 10px 26px rgba(0, 0, 0, 0.28);z-index:20}.theme-dark .workspace-toolbar{background:linear-gradient(120deg,\r\n    rgba(16, 22, 50, 0.9),\r\n    rgba(9, 13, 32, 0.93));border-bottom-color:rgba(80, 90, 160, 0.7)}.theme-sepia .workspace-toolbar{background:linear-gradient(120deg,\r\n    rgba(255, 248, 232, 0.96),\r\n    rgba(248, 232, 205, 0.96));border-bottom-color:rgba(190, 150, 110, 0.75)}.open-btn{background:radial-gradient(circle at top left, #4c8dff, #7d5cff);color:white;padding:7px 16px;border-radius:999px;border:none;cursor:pointer;font-weight:600;box-shadow:0 12px 24px rgba(60, 100, 230, 0.7),\r\n    0 0 16px rgba(110, 145, 255, 0.9);transition:transform 0.12s ease, box-shadow 0.18s ease}.open-btn:hover{transform:translateY(-1px);box-shadow:0 14px 30px rgba(60, 100, 230, 0.85),\r\n    0 0 20px rgba(130, 160, 255, 0.95)}.toolbar-spacer{flex:1}.theme-label{font-weight:500;font-size:13px;opacity:0.85}.theme-select{padding:6px 12px;border-radius:999px;border:1px solid rgba(220, 225, 250, 0.9);background:rgba(255, 255, 255, 0.9);cursor:pointer;font-size:13px;box-shadow:0 8px 18px rgba(40, 60, 140, 0.22);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.theme-dark .theme-select{background:rgba(18, 24, 48, 0.96);border-color:rgba(110, 130, 210, 0.9);color:#f3f4ff}.theme-sepia .theme-select{background:rgba(255, 248, 234, 0.96);border-color:rgba(190, 150, 110, 0.9);color:#3c2916}.workspace-tabs{display:flex;border-bottom:1px solid rgba(255, 255, 255, 0.18);background:linear-gradient(90deg,\r\n    rgba(255, 255, 255, 0.08),\r\n    rgba(255, 255, 255, 0.02));overflow-x:auto;padding:4px 8px;gap:6px}.theme-dark .workspace-tabs{background:linear-gradient(90deg,\r\n    rgba(15, 22, 52, 0.9),\r\n    rgba(10, 14, 32, 0.95));border-bottom-color:rgba(80, 90, 160, 0.7)}.theme-sepia .workspace-tabs{background:linear-gradient(90deg,\r\n    rgba(255, 248, 235, 0.96),\r\n    rgba(246, 233, 210, 0.96));border-bottom-color:rgba(190, 150, 110, 0.75)}.tab{padding:7px 14px;cursor:pointer;position:relative;border-radius:10px;border:1px solid transparent;font-size:13px;white-space:nowrap;background:rgba(255, 255, 255, 0.82);box-shadow:0 8px 16px rgba(40, 60, 140, 0.22);transition:transform 0.12s ease, box-shadow 0.18s ease, background 0.16s ease,\r\n    border-color 0.16s ease}.theme-dark .tab{background:rgba(15, 20, 50, 0.98);box-shadow:0 10px 22px rgba(0, 0, 0, 0.75)}.theme-sepia .tab{background:rgba(255, 248, 234, 0.96);box-shadow:0 8px 18px rgba(170, 130, 90, 0.35)}.tab:hover{transform:translateY(-1px);box-shadow:0 12px 24px rgba(40, 60, 140, 0.28)}.theme-dark .tab:hover{box-shadow:0 12px 26px rgba(0, 0, 0, 0.85)}.tab.active{background:radial-gradient(circle at top left, #4c8dff, #7d5cff);color:white;border-color:rgba(255, 255, 255, 0.9);box-shadow:0 14px 30px rgba(60, 100, 230, 0.9),\r\n    0 0 18px rgba(120, 160, 255, 0.95)}.theme-sepia .tab.active{background:radial-gradient(circle at top left, #ffb36a, #ff7c52)}.close-x{margin-left:8px;cursor:pointer;font-size:12px;opacity:0.8;transition:transform 0.12s ease, color 0.16s ease, opacity 0.12s ease}.close-x:hover{color:#ff3b3b;transform:scale(1.1);opacity:1}.workspace-viewer{flex:1;overflow:hidden;position:relative}.empty{padding:40px;text-align:center;opacity:0.7;font-size:18px}";

const DocWorkspace = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
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
        return (h("div", { key: 'f4dc64087c34375ff8d925d6fc21a25a79150e43', class: `workspace-container theme-${this.theme}` }, h("div", { key: 'd0d0d1f2decc5af7cfff2c1cb8acba3a714bd403', class: "workspace-toolbar" }, h("button", { key: 'f3703b4d9f3f0a617152f28c30cd52eb6aa741c9', class: "open-btn", onClick: () => this.fileInput?.click() }, "\uD83D\uDCC2 Open File"), h("input", { key: '3897c4dc09a3caa46c5e571b0176020fc300e345', type: "file", accept: ".pdf,.png,.jpg,.jpeg,.gif,.bmp,.webp,.txt,.md", style: { display: 'none' }, ref: (el) => (this.fileInput = el), onChange: this.onFileSelected }), h("div", { key: '85dd3f27d82ab406d5b31893189295c32a0f2749', class: "toolbar-spacer" }), h("label", { key: '278e72e8cc95bd712c2f36cef7ef5a6c2fe2cb19', class: "theme-label" }, "Theme:"), h("select", { key: 'bfe26abdef7e66b8a0c2c071daec35fe375940e3', class: "theme-select", onChange: (e) => {
                this.theme = e.target.value;
            } }, h("option", { key: 'bf75d41592c58fc9fe761f8cc333b28b1782b6dc', value: "light", selected: this.theme === 'light' }, "Light"), h("option", { key: '7f56e86ee5e43ab1fb7d1741c20b6adc4b7597c8', value: "dark", selected: this.theme === 'dark' }, "Dark"), h("option", { key: 'df9a34f961fad8b854049785ca6195dcadf955be', value: "sepia", selected: this.theme === 'sepia' }, "Sepia"))), h("div", { key: '9a45bd30f54eabf21983708c2804225971c2c885', class: "workspace-tabs" }, this.files.map((file) => (h("div", { class: {
                tab: true,
                active: file.id === this.activeId,
            }, onClick: () => (this.activeId = file.id) }, file.name, h("span", { class: "close-x", onClick: (ev) => {
                ev.stopPropagation();
                this.closeFile(file.id);
            } }, "\u2716"))))), h("div", { key: 'bdbc5bdb6b5fd15ebb3bbe4c2b24ca487bea81bb', class: "workspace-viewer" }, activeFile ? (h("doc-viewer", { key: activeFile.id, src: activeFile.url, fileType: activeFile.fileType, scale: 1.2, theme: this.theme, mode: "editor" // default for workspace
        })) : (h("div", { class: "empty" }, "No file opened. Click ", h("b", null, "Open File"), ".")))));
    }
};
DocWorkspace.style = docWorkspaceCss;

export { DocPage as doc_page, DocViewer as doc_viewer, DocWorkspace as doc_workspace };
//# sourceMappingURL=doc-page.doc-viewer.doc-workspace.entry.js.map
